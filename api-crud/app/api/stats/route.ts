import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
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
      prisma.resultatDepartement.count(),
      prisma.participationDepartement.count(),
      prisma.commissionDepartementale.count(),
      prisma.membreCommission.count(),
      prisma.redressementBureauVote.count(),
      prisma.redressementCandidat.count(),
      prisma.pvDepartement.count(),
      prisma.participationCommune.count()
    ]);

    // Note: validation_status field does not exist in the database schema

    // Calculate participation statistics
    const participationStats = await prisma.participationDepartement.aggregate({
      _avg: {
        taux_participation: true
      },
      _sum: {
        nombre_inscrit: true,
        nombre_votant: true
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
        note: "validation_status field not available in current database schema"
      },
      participation: {
        taux_moyen: participationStats._avg.taux_participation || 0,
        total_inscrits: participationStats._sum.nombre_inscrit || 0,
        total_votants: participationStats._sum.nombre_votant || 0
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
