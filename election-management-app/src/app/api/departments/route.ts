import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock departments data
    const departments = [
      {
        code: 1,
        libelle: "Wouri",
        abbreviation: "WOU",
        chef_lieu: "Douala",
        region: {
          code: 5,
          libelle: "Littoral",
          abbreviation: "LT"
        },
        participationData: {
          nombre_inscrit: 450000,
          nombre_votant: 285000,
          taux_participation: 63.33,
          bulletin_nul: 5500,
          suffrage_exprime: 279500
        }
      },
      {
        code: 2,
        libelle: "Mfoundi",
        abbreviation: "MFO",
        chef_lieu: "Yaoundé",
        region: {
          code: 2,
          libelle: "Centre",
          abbreviation: "CE"
        },
        participationData: {
          nombre_inscrit: 380000,
          nombre_votant: 245000,
          taux_participation: 64.47,
          bulletin_nul: 3800,
          suffrage_exprime: 241200
        }
      },
      {
        code: 3,
        libelle: "Fako",
        abbreviation: "FAK",
        chef_lieu: "Limbe",
        region: {
          code: 10,
          libelle: "Sud-Ouest",
          abbreviation: "SW"
        },
        participationData: {
          nombre_inscrit: 290000,
          nombre_votant: 198000,
          taux_participation: 68.28,
          bulletin_nul: 2200,
          suffrage_exprime: 195800
        }
      },
      {
        code: 4,
        libelle: "Noun",
        abbreviation: "NOU",
        chef_lieu: "Foumban",
        region: {
          code: 8,
          libelle: "Ouest",
          abbreviation: "OU"
        },
        participationData: {
          nombre_inscrit: 180000,
          nombre_votant: 125000,
          taux_participation: 69.44,
          bulletin_nul: 1800,
          suffrage_exprime: 123200
        }
      }
    ]

    return NextResponse.json({
      success: true,
      data: departments
    })

  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}