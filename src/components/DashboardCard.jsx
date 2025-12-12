import Card from './ui/Card';

export default function DashboardCard({ title, value, icon, trend, color = "text-primary" }) {
    const Icon = icon; // Assign to capitalized variable for generic JSX component use
    return (
        <Card className="flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-full bg-gray-50 ${color}`}>
                {Icon && <Icon size={24} />}
            </div>
            <div>
                <p className="text-sm text-text-light font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-secondary mt-1">{value}</h3>
                {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
            </div>
        </Card>
    );
}
