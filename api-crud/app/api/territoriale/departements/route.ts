import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionCode = searchParams.get('region');
    const includeArrondissements = searchParams.get('include_arrondissements') === 'true';
    const includeStats = searchParams.get('include_stats') === 'true';

    // Build where clause
    const whereClause: any = {};
    if (regionCode) {
      whereClause.code_region = parseInt(regionCode);
    }

    // Get departments
    const departements = await prisma.departement.findMany({
      where: whereClause,
      include: {
        region: true
      },
      orderBy: {
        libelle: 'asc'
      }
    });

    // If include_arrondissements is true, get arrondissements for each department
    if (includeArrondissements) {
      const departementsWithArrondissements = await Promise.all(
        departements.map(async (departement) => {
          const arrondissements = await prisma.arrondissement.findMany({
            where: {
              code_departement: departement.code
            },
            orderBy: {
              libelle: 'asc'
            }
          });

          return {
            ...departement,
            arrondissements
          };
        })
      );

      return NextResponse.json(departementsWithArrondissements);
    }

    // If include_stats is true, add statistics
    if (includeStats) {
      const departementsWithStats = await Promise.all(
        departements.map(async (departement) => {
          const arrondissementCount = await prisma.arrondissement.count({
            where: {
              code_departement: departement.code
            }
          });

          const bureauVoteCount = await prisma.bureauVote.count({
            where: {
              arrondissement: {
                code_departement: departement.code
              }
            }
          });

          const resultatCount = await prisma.resultatDepartement.count({
            where: {
              code_departement: departement.code
            }
          });

          const participationCount = await prisma.participationDepartement.count({
            where: {
              code_departement: departement.code
            }
          });

          return {
            ...departement,
            stats: {
              arrondissements: arrondissementCount,
              bureaux_vote: bureauVoteCount,
              resultats: resultatCount,
              participations: participationCount
            }
          };
        })
      );

      return NextResponse.json(departementsWithStats);
    }

    return NextResponse.json(departements);
  } catch (error) {
    console.error('Error fetching departements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departements' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
