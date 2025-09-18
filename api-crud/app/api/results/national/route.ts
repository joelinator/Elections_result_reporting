import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validationStatus = searchParams.get('validation_status');
    const includePartyDetails = searchParams.get('include_party_details') === 'true';

    // Build where clause based on validation status
    const whereClause: any = {};
    if (validationStatus) {
      whereClause.validation_status = parseInt(validationStatus);
    }

    // Get national results aggregated by party
    const nationalResults = await prisma.resultatDepartement.groupBy({
      by: ['code_parti'],
      where: whereClause,
      _sum: {
        nombre_vote: true
      },
      _count: {
        code_parti: true
      }
    });

    // Get total votes for percentage calculation
    const totalVotes = nationalResults.reduce((sum, result) => sum + (result._sum.nombre_vote || 0), 0);

    // Get party details if requested
    let partyDetails: any[] = [];
    if (includePartyDetails) {
      const partyCodes = nationalResults.map(result => result.code_parti);
      partyDetails = await prisma.partiPolitique.findMany({
        where: {
          code: {
            in: partyCodes
          }
        }
      });
    }

    // Format results with party information
    const formattedResults = nationalResults.map(result => {
      const party = includePartyDetails 
        ? partyDetails.find(p => p.code === result.code_parti)
        : null;
      
      const votes = result._sum.nombre_vote || 0;
      const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

      return {
        code_parti: result.code_parti,
        nombre_vote: votes,
        pourcentage: Math.round(percentage * 100) / 100,
        nombre_departements: result._count.code_parti,
        parti: party ? {
          code: party.code,
          libelle: party.libelle,
          abbreviation: party.abbreviation
        } : null
      };
    });

    // Sort by number of votes (descending)
    formattedResults.sort((a, b) => b.nombre_vote - a.nombre_vote);

    const response = {
      total_votes: totalVotes,
      total_departements: await prisma.departement.count(),
      results: formattedResults,
      metadata: {
        validation_status: validationStatus ? parseInt(validationStatus) : null,
        include_party_details: includePartyDetails,
        generated_at: new Date().toISOString()
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching national results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch national results' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
