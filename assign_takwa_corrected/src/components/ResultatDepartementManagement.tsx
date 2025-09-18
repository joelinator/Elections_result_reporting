import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertCircle, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  Users, 
  BarChart3,
  Download
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTerritorialAccessControl } from '../hooks/useTerritorialAccessControl';
import { 
  getResultatsDepartement, 
  getAccessibleDepartements,
  type ResultatDepartement,
  type Departement,
  type ResultatDepartementFilters
} from '../api/resultatDepartementApi';

interface ResultatDepartementManagementProps {
  className?: string;
}

export const ResultatDepartementManagement: React.FC<ResultatDepartementManagementProps> = ({ 
  className = '' 
}) => {
  const { user } = useAuth();
  const { getUserRoleNames } = useTerritorialAccessControl();
  
  const [resultats, setResultats] = useState<ResultatDepartement[]>([]);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedDepartement, setSelectedDepartement] = useState<number | undefined>();
  const [selectedParti, setSelectedParti] = useState<number | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Stats
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalDepartements, setTotalDepartements] = useState(0);
  const [partisUniques, setPartisUniques] = useState(0);

  const userRoles = getUserRoleNames();
  const isAdmin = userRoles.includes('administrateur');

  // Load accessible departments
  useEffect(() => {
    const loadDepartements = async () => {
      if (!user?.code) return;
      
      try {
        const depts = await getAccessibleDepartements(user.code);
        setDepartements(depts);
      } catch (err) {
        console.error('Error loading departments:', err);
        setError('Erreur lors du chargement des départements');
      }
    };

    loadDepartements();
  }, [user]);

  // Load resultats
  useEffect(() => {
    const loadResultats = async () => {
      if (!user?.code) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const filters: ResultatDepartementFilters = {
          userId: user.code
        };
        
        if (selectedDepartement) {
          filters.departement = selectedDepartement;
        }
        
        if (selectedParti) {
          filters.parti = selectedParti;
        }
        
        const data = await getResultatsDepartement(filters);
        setResultats(data);
        
        // Calculate stats
        const total = data.reduce((sum, r) => sum + r.nombre_vote, 0);
        const uniqueDepts = new Set(data.map(r => r.code_departement)).size;
        const uniquePartis = new Set(data.map(r => r.code_parti)).size;
        
        setTotalVotes(total);
        setTotalDepartements(uniqueDepts);
        setPartisUniques(uniquePartis);
        
      } catch (err) {
        console.error('Error loading resultats:', err);
        setError('Erreur lors du chargement des résultats');
      } finally {
        setLoading(false);
      }
    };

    loadResultats();
  }, [user, selectedDepartement, selectedParti]);

  // Filter results by search term
  const filteredResultats = resultats.filter(resultat => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      resultat.departement.libelle.toLowerCase().includes(searchLower) ||
      resultat.parti.designation.toLowerCase().includes(searchLower) ||
      resultat.parti.abbreviation?.toLowerCase().includes(searchLower)
    );
  });

  // Get unique partis for filter
  const uniquePartis = Array.from(
    new Set(resultats.map(r => r.code_parti))
  ).map(code => {
    const resultat = resultats.find(r => r.code_parti === code);
    return {
      code: code,
      designation: resultat?.parti.designation || '',
      abbreviation: resultat?.parti.abbreviation || ''
    };
  });

  const handleRefresh = () => {
    if (user?.code) {
      const loadResultats = async () => {
        setLoading(true);
        try {
          const filters: ResultatDepartementFilters = {
            userId: user.code
          };
          
          if (selectedDepartement) {
            filters.departement = selectedDepartement;
          }
          
          if (selectedParti) {
            filters.parti = selectedParti;
          }
          
          const data = await getResultatsDepartement(filters);
          setResultats(data);
        } catch (err) {
          console.error('Error refreshing resultats:', err);
          setError('Erreur lors du rafraîchissement des données');
        } finally {
          setLoading(false);
        }
      };
      
      loadResultats();
    }
  };

  const clearFilters = () => {
    setSelectedDepartement(undefined);
    setSelectedParti(undefined);
    setSearchTerm('');
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Département', 'Région', 'Parti', 'Votes', 'Pourcentage'].join(','),
      ...filteredResultats.map(r => [
        r.departement.libelle,
        r.departement.region.libelle,
        r.parti.designation,
        r.nombre_vote,
        r.pourcentage || 0
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultats_departement_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading && resultats.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Chargement des résultats départementaux...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Résultats Départementaux</h2>
          <p className="text-gray-600">
            {isAdmin ? 'Tous les départements' : 'Départements accessibles selon votre rôle'}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Votes</p>
                <p className="text-2xl font-bold text-gray-900">{totalVotes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Départements</p>
                <p className="text-2xl font-bold text-gray-900">{totalDepartements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partis Uniques</p>
                <p className="text-2xl font-bold text-gray-900">{partisUniques}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <Select 
                value={selectedDepartement?.toString() || ''} 
                onValueChange={(value) => setSelectedDepartement(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les départements" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les départements</SelectItem>
                  {departements.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code.toString()}>
                      {dept.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parti Politique
              </label>
              <Select 
                value={selectedParti?.toString() || ''} 
                onValueChange={(value) => setSelectedParti(value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous les partis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les partis</SelectItem>
                  {uniquePartis.map((parti) => (
                    <SelectItem key={parti.code} value={parti.code.toString()}>
                      {parti.abbreviation || parti.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <Input
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" className="w-full">
                Effacer les filtres
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Résultats ({filteredResultats.length} entrée{filteredResultats.length !== 1 ? 's' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResultats.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucun résultat trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Département</TableHead>
                    <TableHead>Région</TableHead>
                    <TableHead>Parti</TableHead>
                    <TableHead className="text-right">Votes</TableHead>
                    <TableHead className="text-right">Pourcentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResultats.map((resultat) => (
                    <TableRow key={`${resultat.code_departement}-${resultat.code_parti}`}>
                      <TableCell className="font-medium">
                        {resultat.departement.libelle}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {resultat.departement.region.libelle}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{resultat.parti.designation}</div>
                          {resultat.parti.abbreviation && (
                            <div className="text-sm text-gray-500">
                              {resultat.parti.abbreviation}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {resultat.nombre_vote.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {resultat.pourcentage ? (
                          <Badge variant="secondary">
                            {resultat.pourcentage.toFixed(2)}%
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultatDepartementManagement;
