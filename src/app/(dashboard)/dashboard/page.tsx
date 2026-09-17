import { 
  Package, 
  DollarSign, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-slate-500 text-[15px]">Welcome back, James! Here's what's happening with your store today.</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        
        {/* Card 1: Total Inventory Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-blue-50 text-blue-600">
              <Package className="w-6 h-6" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium space-x-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+12.5%</span>
            </div>
          </div>
          <div>
            <h3 className="text-[26px] font-bold text-slate-900 mb-1">₱498,900</h3>
            <p className="text-[15px] text-slate-600 font-medium">Total Inventory Value</p>
            <p className="text-sm text-slate-400 mt-0.5">8 products in stock</p>
          </div>
        </div>

        {/* Card 2: Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-emerald-50 text-emerald-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex items-center text-emerald-500 text-sm font-medium space-x-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+23.1%</span>
            </div>
          </div>
          <div>
            <h3 className="text-[26px] font-bold text-slate-900 mb-1">₱353,700</h3>
            <p className="text-[15px] text-slate-600 font-medium">Total Sales (Last 7 Days)</p>
            <p className="text-sm text-slate-400 mt-0.5">8 transactions</p>
          </div>
        </div>

        {/* Card 3: Active Warranties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-teal-50 text-teal-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex items-center text-orange-500 text-sm font-medium space-x-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>2 expiring soon</span>
            </div>
          </div>
          <div>
            <h3 className="text-[26px] font-bold text-slate-900 mb-1">3</h3>
            <p className="text-[15px] text-slate-600 font-medium">Active Warranties</p>
            <p className="text-sm text-slate-400 mt-0.5">6 total warranties</p>
          </div>
        </div>

        {/* Card 4: General Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-orange-50 text-orange-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex items-center text-orange-500 text-sm font-medium space-x-1">
              <ArrowDownRight className="w-4 h-4" />
              <span>Needs attention</span>
            </div>
          </div>
          <div>
            <h3 className="text-[26px] font-bold text-slate-900 mb-1">1</h3>
            <p className="text-[15px] text-slate-600 font-medium">General Alerts</p>
            <p className="text-sm text-slate-400 mt-0.5">Requires immediate action</p>
          </div>
        </div>

      </div>
    </div>
  );
}
