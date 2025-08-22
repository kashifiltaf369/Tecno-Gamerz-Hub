import * as React from "react";
import { cn } from "./lib/utils";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import type { Role } from "@tecno-gamerz/types";

// Role-based access control components
export interface RequireRoleProps {
  roles: Role[];
  userRoles?: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireRole: React.FC<RequireRoleProps> = ({
  roles,
  userRoles = [],
  children,
  fallback = null,
}) => {
  const hasRequiredRole = roles.some(role => userRoles.includes(role));
  
  if (!hasRequiredRole) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Conditional rendering based on user role
export interface WhenProps {
  role: Role;
  userRoles?: Role[];
  children: React.ReactNode;
}

export const When: React.FC<WhenProps> = ({ role, userRoles = [], children }) => {
  if (!userRoles.includes(role)) {
    return null;
  }
  
  return <>{children}</>;
};

// OAuth provider button
export interface OAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'twitch' | 'youtube';
  loading?: boolean;
}

const providerConfig = {
  google: {
    name: 'Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    className: "bg-white text-gray-900 hover:bg-gray-50 border border-gray-300",
  },
  twitch: {
    name: 'Twitch',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
      </svg>
    ),
    className: "bg-[#9146ff] text-white hover:bg-[#7c3aed]",
  },
  youtube: {
    name: 'YouTube',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    className: "bg-[#ff0000] text-white hover:bg-[#cc0000]",
  },
};

export const OAuthButton = React.forwardRef<HTMLButtonElement, OAuthButtonProps>(
  ({ provider, loading, className, children, ...props }, ref) => {
    const config = providerConfig[provider];
    
    return (
      <Button
        ref={ref}
        className={cn(config.className, className)}
        loading={loading}
        {...props}
      >
        {!loading && config.icon}
        {children || `Continue with ${config.name}`}
      </Button>
    );
  }
);
OAuthButton.displayName = "OAuthButton";

// Sign-in form component
export interface SignInFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  loading?: boolean;
  error?: string;
  showPasswordLogin?: boolean;
  providers?: Array<'google' | 'twitch' | 'youtube'>;
  onProviderLogin?: (provider: string) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({
  onSubmit,
  loading = false,
  error,
  showPasswordLogin = false,
  providers = ['google', 'twitch', 'youtube'],
  onProviderLogin,
}) => {
  const [formData, setFormData] = React.useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your Tecno Gamerz Hub account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        {/* OAuth Providers */}
        {providers.length > 0 && (
          <div className="space-y-2">
            {providers.map((provider) => (
              <OAuthButton
                key={provider}
                provider={provider}
                className="w-full"
                onClick={() => onProviderLogin?.(provider)}
                loading={loading}
              />
            ))}
          </div>
        )}

        {/* Divider */}
        {showPasswordLogin && providers.length > 0 && (
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        {showPasswordLogin && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={loading}
            />
            <Input
              type="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full" loading={loading}>
              Sign In
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

// User profile component
export interface UserProfileProps {
  user: {
    id: string;
    email: string;
    username?: string;
    image?: string;
    roles: Role[];
  };
  onSignOut?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
  const displayName = user.username || user.email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center space-x-3">
      {user.image ? (
        <img
          src={user.image}
          alt={displayName}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gaming-purple text-white flex items-center justify-center text-sm font-medium">
          {initials}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        <p className="text-xs text-muted-foreground">
          {user.roles.join(', ')}
        </p>
      </div>
      {onSignOut && (
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          Sign Out
        </Button>
      )}
    </div>
  );
};

// Protected route wrapper
export interface ProtectedRouteProps {
  isAuthenticated: boolean;
  requiredRoles?: Role[];
  userRoles?: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAuthenticated,
  requiredRoles = [],
  userRoles = [],
  children,
  fallback,
}) => {
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : <div>Please sign in to continue</div>;
  }

  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
    if (!hasRequiredRole) {
      return fallback ? <>{fallback}</> : <div>Access denied</div>;
    }
  }

  return <>{children}</>;
};