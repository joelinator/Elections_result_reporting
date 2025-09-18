import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDepartements = searchParams.get('include_departements') === 'true';
    const includeStats = searchParams.get('include_stats') === 'true';

    // Get all regions
    const regions = await prisma.region.findMany({
      orderBy: {
        libelle: 'asc'
      }
    });

    // If include_departements is true, get departments for each region
    if (includeDepartements) {
      const regionsWithDepartements = await Promise.all(
        regions.map(async (region) => {
          const departements = await prisma.departement.findMany({
            where: {
              code_region: region.code
            },
            orderBy: {
              libelle: 'asc'
            }
          });

          return {
            ...region,
            departements
          };
        })
      );

      return NextResponse.json(regionsWithDepartements);
    }

    // If include_stats is true, add statistics
    if (includeStats) {
      const regionsWithStats = await Promise.all(
        regions.map(async (region) => {
          const departementCount = await prisma.departement.count({
            where: {
              code_region: region.code
            }
          });

          const arrondissementCount = await prisma.arrondissement.count({
            where: {
              departement: {
                code_region: region.code
              }
            }
          });

          const bureauVoteCount = await prisma.bureauVote.count({
            where: {
              arrondissement: {
                departement: {
                  code_region: region.code
                }
              }
            }
          });

          return {
            ...region,
            stats: {
              departements: departementCount,
              arrondissements: arrondissementCount,
              bureaux_vote: bureauVoteCount
            }
          };
        })
      );

      return NextResponse.json(regionsWithStats);
    }

    return NextResponse.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch regions' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
