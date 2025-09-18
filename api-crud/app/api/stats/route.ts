import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validationStatus = searchParams.get('validation_status');

    // Build where clause based on validation status
    const whereClause: any = {};
    if (validationStatus) {
      whereClause.validation_status = parseInt(validationStatus);
    }

    // Get statistics for different entities
    const [
      totalRegions,
      totalDepartements,
      totalArrondissements,
      totalBureauxVote,
      totalResultats,
      totalParticipations,
      totalCommissions,
      totalMembresCommission,
      totalRedressementsBureau,
      totalRedressementsCandidat,
      totalPvDepartement,
      totalParticipationCommune
    ] = await Promise.all([
      prisma.region.count(),
      prisma.departement.count(),
      prisma.arrondissement.count(),
      prisma.bureauVote.count(),
      prisma.resultatDepartement.count({ where: whereClause }),
      prisma.participationDepartement.count({ where: whereClause }),
      prisma.commissionDepartementale.count(),
      prisma.membreCommission.count(),
      prisma.redressementBureauVote.count({ where: whereClause }),
      prisma.redressementCandidat.count({ where: whereClause }),
      prisma.pvDepartement.count(),
      prisma.participationCommune.count()
    ]);

    // Calculate validation statistics
    const validationStats = await prisma.resultatDepartement.groupBy({
      by: ['validation_status'],
      _count: {
        validation_status: true
      }
    });

    // Calculate participation statistics
    const participationStats = await prisma.participationDepartement.aggregate({
      _avg: {
        taux_participation: true
      },
      _sum: {
        nombre_inscrits: true,
        nombre_votants: true
      }
    });

    // Calculate results statistics
    const resultsStats = await prisma.resultatDepartement.aggregate({
      _sum: {
        nombre_vote: true
      }
    });

    const stats = {
      territorial: {
        regions: totalRegions,
        departements: totalDepartements,
        arrondissements: totalArrondissements,
        bureaux_vote: totalBureauxVote
      },
      data: {
        resultats: totalResultats,
        participations: totalParticipations,
        commissions: totalCommissions,
        membres_commission: totalMembresCommission,
        redressements_bureau: totalRedressementsBureau,
        redressements_candidat: totalRedressementsCandidat,
        pv_departement: totalPvDepartement,
        participation_commune: totalParticipationCommune
      },
      validation: {
        by_status: validationStats.reduce((acc, stat) => {
          acc[stat.validation_status] = stat._count.validation_status;
          return acc;
        }, {} as Record<number, number>)
      },
      participation: {
        taux_moyen: participationStats._avg.taux_participation || 0,
        total_inscrits: participationStats._sum.nombre_inscrits || 0,
        total_votants: participationStats._sum.nombre_votants || 0
      },
      results: {
        total_votes: resultsStats._sum.nombre_vote || 0
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
