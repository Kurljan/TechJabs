"use client";

import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { GoogleIcon, FacebookIcon, XIcon, LogoPlaceholder } from "@/components/Icons";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    
    if (result?.error) {
      alert("Invalid credentials. Try: Therdy@gmail.com / password");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#EFEFEF]">
      {/* Top Blue Background */}
      <div className="absolute top-0 left-0 right-0 h-[55%] bg-primary-600 rounded-b-[40px] sm:rounded-none z-0"></div>

      <div className="relative z-10 flex flex-col items-center pt-20 px-4 flex-1">
        
        {/* Logo container */}
        <div className="w-28 h-28 bg-white rounded-3xl shadow-md flex items-center justify-center mb-6">
          <LogoPlaceholder />
        </div>

        <h1 className="text-white text-3xl font-medium mb-1">Welcome!</h1>
        <p className="text-white/90 text-sm mb-10">Sign in to continue</p>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSignIn}>
            
            {/* Username or Email */}
            <div>
              <label className="block text-sm text-gray-800 mb-2 font-medium">Username or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Therdy@gmail.com"
                  className="block w-full pl-11 pr-3 py-3.5 border border-transparent rounded-2xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900 text-sm"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-800 mb-2 font-medium">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="***********"
                  className="block w-full pl-11 pr-11 py-3.5 border border-transparent rounded-2xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-white"
                />
                <span className="ml-2 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-primary-500 hover:text-primary-600">
                Forgot password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white rounded-2xl py-3.5 font-medium hover:bg-primary-700 transition-colors shadow-sm text-sm disabled:opacity-70"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 relative flex items-center justify-center">
            <div className="w-12 border-t border-gray-300"></div>
            <span className="px-3 bg-white text-gray-500 text-sm">or</span>
            <div className="w-12 border-t border-gray-300"></div>
          </div>

          {/* Social Logins */}
          <div className="mt-6 flex justify-center space-x-6 pb-2">
            <button className="text-gray-700 hover:opacity-80 transition-opacity">
              <GoogleIcon className="w-8 h-8" />
            </button>
            <button className="text-primary-600 hover:opacity-80 transition-opacity">
              <FacebookIcon className="w-8 h-8" />
            </button>
            <button className="text-black hover:opacity-80 transition-opacity">
              <XIcon className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
