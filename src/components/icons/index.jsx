import {
    CheckCircle,
    AlertCircle,
    Info,
    Upload,
    BookOpen,
    Briefcase,
    Users,
    Home,
    ShieldCheck,
    LogIn,
    LogOut,
    ChevronRight,
    ChevronDown, // Added
    Menu,
    X,
    Rocket,
    Award,
    CreditCard,
    Clock,
    Calendar,
    Search,
    Plus,
    Filter,
    Download as DownloadIcon,
    Trash2,
    Edit,
    Mail,
    UserPlus,
    MessageSquare,
    MessageCircle, // Added
    BarChart,
    Dot,
    User, // Added
    LayoutDashboard, // Added
    Settings, // Added for ProgramForm
    FileText, // Added
    ArrowLeft, // Added
} from 'lucide-react';

export const Icons = {
    // Navigation & General
    Rocket: (props) => <Rocket className="text-primary" {...props} />,
    ShieldCheck: (props) => <ShieldCheck className="text-secondary" {...props} />,
    Home: (props) => <Home className="text-secondary" {...props} />,
    BookOpen: (props) => <BookOpen className="text-secondary" {...props} />, // Added for generic usage
    Courses: (props) => <BookOpen className="text-secondary" {...props} />,
    Internships: (props) => <Briefcase className="text-secondary" {...props} />,
    Workshops: (props) => <Users className="text-secondary" {...props} />,
    Users: (props) => <Users className="text-secondary" {...props} />,
    Verify: (props) => <ShieldCheck className="text-secondary" {...props} />,
    Login: (props) => <LogIn className="text-secondary" {...props} />,
    Logout: (props) => <LogOut className="text-secondary" {...props} />,
    LogOut: (props) => <LogOut className="text-secondary" {...props} />, // Added alias

    // UI Controls
    Menu: (props) => <Menu className="text-primary" {...props} />,
    Close: (props) => <X className="text-primary" {...props} />,
    X: (props) => <X className="text-primary" {...props} />, // Added alias
    ChevronRight: (props) => <ChevronRight className="text-gray-400" {...props} />,
    ChevronDown: (props) => <ChevronDown className="text-gray-400" {...props} />, // Added
    Search: (props) => <Search className="text-gray-400" {...props} />,
    Plus: (props) => <Plus className="text-primary" {...props} />,
    Filter: (props) => <Filter className="text-secondary" {...props} />,
    Download: (props) => <DownloadIcon className="text-secondary" {...props} />,
    Edit: (props) => <Edit className="text-blue-600" {...props} />,
    Trash: (props) => <Trash2 className="text-danger" {...props} />,
    Dot: (props) => <Dot {...props} />,

    // Communication
    Mail: (props) => <Mail className="text-secondary" {...props} />,
    UserPlus: (props) => <UserPlus className="text-secondary" {...props} />,
    MessageSquare: (props) => <MessageSquare className="text-secondary" {...props} />,
    MessageCircle: (props) => <MessageCircle className="text-secondary" {...props} />, // Added
    BarChart: (props) => <BarChart className="text-secondary" {...props} />,
    CheckCircle: (props) => <CheckCircle className="text-success" {...props} />,
    AlertCircle: (props) => <AlertCircle className="text-danger" {...props} />,

    // Status
    Success: (props) => <CheckCircle className="text-success" {...props} />,
    Danger: (props) => <AlertCircle className="text-danger" {...props} />,
    Info: (props) => <Info className="text-secondary" {...props} />,

    // Feature Specific
    HelpCircle: (props) => <AlertCircle className="text-secondary" {...props} />, // Fallback to AlertCircle
    Duration: (props) => <Clock className="text-primary" {...props} />,
    Date: (props) => <Calendar className="text-primary" {...props} />,
    Fee: (props) => <CreditCard className="text-primary" {...props} />,
    Certificate: (props) => <Award className="text-primary" {...props} />,
    Award: (props) => <Award className="text-secondary" {...props} />, // Added specifically for direct usage
    Settings: (props) => <Settings className="text-secondary" {...props} />, // Added for ProgramForm
    Quiz: (props) => <Rocket className="text-primary" {...props} />,
    Upload: (props) => <Upload className="text-primary" {...props} />,
    User: (props) => <User className="text-primary" {...props} />, // Added
    Dashboard: (props) => <LayoutDashboard className="text-primary" {...props} />, // Added
    Clock: (props) => <Clock className="text-primary" {...props} />, // Added generic Clock
    FileText: (props) => <FileText className="text-secondary" {...props} />, // Added
    ArrowLeft: (props) => <ArrowLeft className="text-secondary" {...props} />, // Added
};