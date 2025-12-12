import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Icons } from '../components/icons';
import Button from '../components/ui/Button';

export default function Verify() {
    const [searchParams] = useSearchParams();
    const codeFromUrl = searchParams.get('code');
    const [code, setCode] = useState(codeFromUrl || '');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (codeFromUrl) {
            handleVerify(codeFromUrl);
        }
    }, [codeFromUrl]);

    const handleVerify = async (codeToVerify) => {
        if (!codeToVerify) return;
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Using direct axios call or via api.js if we add verifyCertificate there
            // api.js base is /api. Let's assume public access.
            const apiUrl = import.meta.env.VITE_API_URL || '';
            const response = await axios.get(`${apiUrl}/api/certificates/verify/${codeToVerify}`);
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid Certificate Code or Network Error");
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleVerify(code);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden animate-in fade-in duration-500">
                <div className="bg-primary p-6 text-center text-white">
                    <Icons.Shield size={48} className="mx-auto mb-4 opacity-90" />
                    <h1 className="text-2xl font-bold">Certificate Verification</h1>
                    <p className="text-white/80 mt-2">Verify the authenticity of EdinzTech certificates</p>
                </div>

                <div className="p-8">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Certificate ID
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter Certificate Code (e.g. CERT-1234)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Verifying...' : 'Verify Certificate'}
                        </Button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2">
                            <Icons.AlertCircle className="shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold">Verification Failed</h3>
                                <p className="text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && result.valid && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg text-green-800 animate-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 mb-3">
                                <Icons.CheckCircle className="text-green-600" />
                                <h3 className="font-bold text-lg">Valid Certificate</h3>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-semibold">Student:</span> {result.details.studentName}</p>
                                <p><span className="font-semibold">Program:</span> {result.details.program}</p>
                                <p><span className="font-semibold">Issued On:</span> {new Date(result.details.issuedAt).toLocaleDateString()}</p>
                                <p><span className="font-semibold">Code:</span> {result.details.code}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}