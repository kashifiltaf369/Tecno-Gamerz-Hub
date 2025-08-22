import * as React from "react";
import { cn } from "./lib/utils";
import { Button } from "./button";
import { Card } from "./card";
import type { Role } from "@tecno-gamerz/types";

// Main layout container
export interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  sidebar,
  header,
  footer,
  className,
  ...props
}) => {
  return (
    <div className={cn("min-h-screen bg-background", className)} {...props}>
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {header}
        </header>
      )}
      
      <div className="flex flex-1">
        {sidebar && (
          <aside className="w-64 border-r bg-background/95 backdrop-blur">
            {sidebar}
          </aside>
        )}
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
      
      {footer && (
        <footer className="border-t bg-background/95 backdrop-blur">
          {footer}
        </footer>
      )}
    </div>
  );
};

// Navigation header
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  requiredRoles?: Role[];
}

export interface HeaderProps {
  brand?: React.ReactNode;
  navigation?: NavItem[];
  actions?: React.ReactNode;
  user?: React.ReactNode;
  userRoles?: Role[];
}

export const Header: React.FC<HeaderProps> = ({
  brand,
  navigation = [],
  actions,
  user,
  userRoles = [],
}) => {
  return (
    <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
      {/* Brand */}
      {brand && (
        <div className="flex items-center space-x-2">
          {brand}
        </div>
      )}
      
      {/* Navigation */}
      {navigation.length > 0 && (
        <nav className="flex items-center space-x-6 text-sm font-medium">
          {navigation.map((item) => {
            // Check role permissions
            if (item.requiredRoles && item.requiredRoles.length > 0) {
              const hasRequiredRole = item.requiredRoles.some(role => userRoles.includes(role));
              if (!hasRequiredRole) return null;
            }
            
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  item.active ? "text-foreground" : "text-foreground/60",
                  item.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
              </a>
            );
          })}
        </nav>
      )}
      
      {/* Actions and User */}
      <div className="flex items-center space-x-4">
        {actions}
        {user}
      </div>
    </div>
  );
};

// Sidebar navigation
export interface SidebarProps {
  navigation: NavItem[];
  userRoles?: Role[];
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navigation,
  userRoles = [],
  className,
}) => {
  return (
    <div className={cn("flex h-full w-full flex-col space-y-2 p-4", className)}>
      {navigation.map((item) => {
        // Check role permissions
        if (item.requiredRoles && item.requiredRoles.length > 0) {
          const hasRequiredRole = item.requiredRoles.some(role => userRoles.includes(role));
          if (!hasRequiredRole) return null;
        }
        
        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              item.active
                ? "bg-accent text-accent-foreground"
                : "hover:bg-accent hover:text-accent-foreground",
              item.disabled && "cursor-not-allowed opacity-50"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </a>
        );
      })}
    </div>
  );
};

// Dashboard layout with role-based navigation
export interface DashboardLayoutProps {
  user: {
    id: string;
    email: string;
    username?: string;
    image?: string;
    roles: Role[];
  };
  children: React.ReactNode;
  onSignOut?: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  user,
  children,
  onSignOut,
}) => {
  const navigation: NavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
        </svg>
      ),
    },
    {
      label: "Tournaments",
      href: "/tournaments",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      label: "Videos",
      href: "/videos",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      requiredRoles: ["GAMER", "ADMIN"],
    },
    {
      label: "Shop",
      href: "/shop",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      label: "Giveaways",
      href: "/giveaways",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      ),
    },
    {
      label: "Admin",
      href: "/admin",
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      requiredRoles: ["ADMIN"],
    },
  ];

  const displayName = user.username || user.email.split('@')[0];

  return (
    <Layout
      header={
        <Header
          brand={
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-gaming-neon to-gaming-electric"></div>
              <span className="font-bold text-lg">Tecno Gamerz Hub</span>
            </div>
          }
          actions={
            <div className="flex items-center space-x-2">
              {user.image ? (
                <img
                  src={user.image}
                  alt={displayName}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gaming-purple text-white flex items-center justify-center text-sm font-medium">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{displayName}</p>
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
          }
        />
      }
      sidebar={<Sidebar navigation={navigation} userRoles={user.roles} />}
    >
      <div className="container py-6">
        {children}
      </div>
    </Layout>
  );
};

// Content container
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Page header
export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  breadcrumbs,
}) => {
  return (
    <div className="space-y-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg className="h-4 w-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-foreground">
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-foreground">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
    </div>
  );
};