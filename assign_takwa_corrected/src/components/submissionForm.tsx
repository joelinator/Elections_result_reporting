// SubmissionForm.tsx
import React, { useEffect, useState } from 'react';
import type { PollingStation, VoterStats, PartyVotes, PoliticalParty } from '../data/submissionData';
import { getPoliticalParties } from '../api/submissionApi';

interface SubmissionFormProps {
    station: PollingStation;
    onSubmit: (voterStats: VoterStats, partyVotes: PartyVotes[], image: File | undefined) => void;
    onClose: () => void;
}

const SubmissionForm: React.FC<SubmissionFormProps> = ({ station, onSubmit, onClose }) => {
    const [voterStats, setVoterStats] = useState<VoterStats>({
        nombreInscrit: 0,
        nombreVotant: 0,
        bulletinNul: 0
    });

    const [partyVotes, setPartyVotes] = useState<{ [key: number]: number }>({});
    const [selectedImage, setSelectedImage] = useState<File | undefined>();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [parties, setParties] = useState<PoliticalParty[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [warnings, setWarnings] = useState<{ [key: string]: string }>({});

    const isFormComplete = () => {
        return (
            voterStats.nombreInscrit > 0 &&
            voterStats.nombreVotant > 0 &&
            voterStats.bulletinNul >= 0 &&
            selectedImage !== undefined
        );
    };

    useEffect(() => {
        const fetchParties = async () => {
            try {
                const response = await getPoliticalParties();
                setParties(response);
                console.log(response);

                // Initialize votes to 0 for all parties
                const initialVotes: { [key: number]: number } = {};
                response.forEach(party => {
                  initialVotes[party.code] = 0;
                });
                console.log(initialVotes);
                setPartyVotes(initialVotes);
            } catch (error) {
                console.error('Error fetching parties:', error);
            }
        };

        fetchParties();
    }, []);

    const handleVoterStatsChange = (field: keyof VoterStats, value: string) => {

        const numValue = parseInt(value) || 0;
        console.log(numValue);

        setVoterStats(prev => ({ ...prev, [field]: numValue }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handlePartyVotesChange = (partyId: number, votes: number) => {
        console.log(partyId);
        setPartyVotes(prev => ({
            ...prev,
            [partyId]: votes
        }));
        console.log(partyVotes);
    };
    
    const getPartyVote = (partyId: number): number => {
        return partyVotes[partyId] || 0;
    };

    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors(prev => ({ ...prev, image: 'La taille du fichier ne doit pas dépasser 5MB' }));
                return;
            }
            setSelectedImage(file);
            setErrors(prev => ({ ...prev, image: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        const newWarnings: { [key: string]: string } = {};
        // Validate voter stats
        if (voterStats.nombreInscrit <= 0) {
            newErrors.nombreInscrit = 'Le nombre d\'inscrits doit être supérieur à 0';
        }
        if (voterStats.nombreVotant <= 0) {
            newErrors.nombreVotant = 'Le nombre de votants doit être supérieur à 0';
        }
        if (voterStats.nombreVotant > voterStats.nombreInscrit) {
            newWarnings.nombreVotant = 'Le nombre de votants ne peut pas dépasser le nombre d\'inscrits';
        }
        if (voterStats.bulletinNul < 0) {
            newErrors.bulletinNul = 'Le nombre de bulletins nuls ne peut pas être négatif';
        }

        if (!selectedImage) {
            newErrors.image = 'Veuillez télécharger une photo du procès-verbal';
        }

        // Validate party votes
        const totalVotes = Object.values(partyVotes).reduce((sum, votes) => sum + votes, 0);
        const validVotes = voterStats.nombreVotant - voterStats.bulletinNul;

        if (totalVotes !== validVotes) {
            newWarnings.partyVotes = `Total des votes (${totalVotes}) ne correspond pas aux votes valides (${validVotes})`;
        }

        setErrors(newErrors);
        setWarnings(newWarnings);
        return Object.keys(newErrors).length === 0;
    };


    const handleSubmit = async (e: React.FormEvent) => {
        // console.log('in handle submit function');
        e.preventDefault();
        // console.log(voterStats, selectedImage, partyVotes)
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);

        try {
            const partyVotesData: PartyVotes[] = Object.entries(partyVotes).map(([partyId, votes]) => ({
                partyId: parseInt(partyId),
                nombreVote: votes
            }));

            await onSubmit(voterStats, partyVotesData, selectedImage);
            // Form will close on successful submission
        } catch (error) {
            console.error('Submission error:', error);
            setErrors(prev => ({ ...prev, submit: 'Erreur lors de la soumission. Veuillez réessayer.' }));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-4 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Saisie des résultats - {station.designation}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Voter Statistics Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques des électeurs</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre d'inscrits
                                </label>
                                <input
                                    type="text"
                                    placeholder={(voterStats.nombreInscrit).toString()}
                                    onChange={(e) => handleVoterStatsChange('nombreInscrit', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nombreInscrit}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de votants
                                </label>
                                <input
                                    type="text"
                                    placeholder={(voterStats.nombreVotant.toString())}
                                    onChange={(e) => handleVoterStatsChange('nombreVotant', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors && (
                                    <p className="mt-1 text-sm text-red-600">{errors.nombreVotant}</p>
                                )}
                                {warnings.nombreVotant && (
                                    <p className="mt-1 text-sm text-yellow-600">{warnings.nombreVotant}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bulletins nuls
                                </label>
                                <input
                                    type="text"
                                    placeholder={(voterStats.bulletinNul).toString()}
                                    onChange={(e) => handleVoterStatsChange('bulletinNul', e.target.value)}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.bulletin_nul ? 'border-red-500' : 'border-gray-300'}`}
                                    required
                                />
                                {errors && (
                                    <p className="mt-1 text-sm text-red-600">{errors.bulletinNul}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Political Parties Section */}
                    <div className=" md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {parties.map((party) => (
                            // console.log(party);
                            <div key={party.code} className="bg-white p-4 rounded-lg border">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {party.abbreviation}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Nombre de votes"
                                    // value={getPartyVote(party.id) || ''}
                                    onChange={(e) => handlePartyVotesChange(party.code, parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>


                    {/* Image Upload Section */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Photo du procès-verbal</h3>

                        <div className="flex flex-col space-y-4">
                            {/* Upload Button */}
                            <label className="flex flex-col items-center px-4 py-6 bg-white text-blue-600 rounded-lg border-2 border-dashed border-blue-600 cursor-pointer hover:bg-blue-50 transition-colors">
                                <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-sm font-medium">Ajouter une photo</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    className="hidden"
                                    capture="environment"
                                    required // For mobile devices to use camera
                                />
                            </label>
                            {errors.image && (
                                <p className="text-sm text-red-600">{errors.image}</p>
                            )}

                            {/* Image Preview */}
                            {selectedImage && (
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-900">Image sélectionnée</h4>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImage(undefined)}
                                            className="text-red-600 hover:text-red-800 p-1"
                                            title="Supprimer l'image"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        {/* Thumbnail Preview */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                                            <img
                                                src={URL.createObjectURL(selectedImage)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {selectedImage.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {selectedImage.type}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Help Text */}
                            <p className="text-sm text-gray-500">
                                📸 Prenez une photo claire du procès-verbal ou sélectionnez une image depuis votre appareil.
                                Formats acceptés: JPG, PNG, JPEG. Taille maximale: 5MB.
                            </p>
                        </div>
                    </div>
                    {warnings.partyVotes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                            <p className="text-sm text-yellow-700">{warnings.partyVotes}</p>
                        </div>
                    )}


                    <button
                        type='submit'
                        onClick={isSubmitting ? () => {} : handleSubmit}
                        disabled={isSubmitting}
                        className={` ${isSubmitting || !isFormComplete()
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
                            } bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mx-auto block`}>
                        Soumettre les Résultats
                    </button>

                </form>
            </div >
        </div >
    );
};

export default SubmissionForm;