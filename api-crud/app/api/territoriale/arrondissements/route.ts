import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departementCode = searchParams.get('departement');
    const regionCode = searchParams.get('region');
    const includeBureauxVote = searchParams.get('include_bureaux_vote') === 'true';
    const includeStats = searchParams.get('include_stats') === 'true';

    // Build where clause
    const whereClause: any = {};
    if (departementCode) {
      whereClause.code_departement = parseInt(departementCode);
    }
    if (regionCode) {
      whereClause.departement = {
        code_region: parseInt(regionCode)
      };
    }

    // Get arrondissements
    const arrondissements = await prisma.arrondissement.findMany({
      where: whereClause,
      include: {
        departement: {
          include: {
            region: true
          }
        }
      },
      orderBy: {
        libelle: 'asc'
      }
    });

    // If include_bureaux_vote is true, get bureaux de vote for each arrondissement
    if (includeBureauxVote) {
      const arrondissementsWithBureauxVote = await Promise.all(
        arrondissements.map(async (arrondissement) => {
          const bureauxVote = await prisma.bureauVote.findMany({
            where: {
              code_arrondissement: arrondissement.code
            },
            orderBy: {
              libelle: 'asc'
            }
          });

          return {
            ...arrondissement,
            bureaux_vote: bureauxVote
          };
        })
      );

      return NextResponse.json(arrondissementsWithBureauxVote);
    }

    // If include_stats is true, add statistics
    if (includeStats) {
      const arrondissementsWithStats = await Promise.all(
        arrondissements.map(async (arrondissement) => {
          const bureauVoteCount = await prisma.bureauVote.count({
            where: {
              code_arrondissement: arrondissement.code
            }
          });

          const participationCommuneCount = await prisma.participationCommune.count({
            where: {
              codeCommune: arrondissement.code
            }
          });

          const documentCount = await prisma.documentArrondissement.count({
            where: {
              code_arrondissement: arrondissement.code
            }
          });

          return {
            ...arrondissement,
            stats: {
              bureaux_vote: bureauVoteCount,
              participations_commune: participationCommuneCount,
              documents: documentCount
            }
          };
        })
      );

      return NextResponse.json(arrondissementsWithStats);
    }

    return NextResponse.json(arrondissements);
  } catch (error) {
    console.error('Error fetching arrondissements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch arrondissements' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
