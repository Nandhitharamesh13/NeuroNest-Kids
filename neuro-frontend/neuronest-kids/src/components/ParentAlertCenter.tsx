import { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, AlertTriangle, Trophy, TrendingUp, Flame, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ParentAlert } from '@/hooks/useParentAlerts';
import { useParentAlertsContext } from '@/contexts/ParentAlertsContext';
import { cn } from '@/lib/utils';

export function ParentAlertCenter() {
  const { alerts, unreadCount, markAsRead, markAllAsRead, deleteAlert, clearAllAlerts } = useParentAlertsContext();
  const [isOpen, setIsOpen] = useState(false);

  const getAlertIcon = (type: ParentAlert['type']) => {
    switch (type) {
      case 'milestone':
        return <Trophy className="w-5 h-5 text-duo-yellow" />;
      case 'struggle':
        return <AlertTriangle className="w-5 h-5 text-duo-orange" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-duo-green" />;
      case 'daily_summary':
        return <Calendar className="w-5 h-5 text-duo-blue" />;
      case 'streak':
        return <Flame className="w-5 h-5 text-duo-orange" />;
      case 'improvement':
        return <TrendingUp className="w-5 h-5 text-duo-green" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type: ParentAlert['type']) => {
    switch (type) {
      case 'milestone':
        return 'bg-duo-yellow/10 border-duo-yellow/30';
      case 'struggle':
        return 'bg-duo-orange/10 border-duo-orange/30';
      case 'achievement':
        return 'bg-duo-green/10 border-duo-green/30';
      case 'daily_summary':
        return 'bg-duo-blue/10 border-duo-blue/30';
      case 'streak':
        return 'bg-duo-orange/10 border-duo-orange/30';
      case 'improvement':
        return 'bg-duo-green/10 border-duo-green/30';
      default:
        return 'bg-muted';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-white/50">
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-duo-red text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-3">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-xl flex items-center gap-2">
              <Bell className="w-5 h-5 text-duo-purple" />
              Notifications
            </SheetTitle>
            {alerts.length > 0 && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                  <CheckCheck className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              </div>
            )}
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="w-fit">
              {unreadCount} unread
            </Badge>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-4 pr-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                We'll notify you about milestones and achievements!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
            {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer',
                    getAlertColor(alert.type),
                    !alert.isRead && 'ring-2 ring-primary/20'
                  )}
                  onClick={() => markAsRead(alert.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">
                          {alert.title}
                        </h4>
                        {!alert.isRead && (
                          <span className="w-2 h-2 bg-duo-blue rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(alert.createdAt)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {alert.childName}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 w-8 h-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAlert(alert.id);
                      }}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {alerts.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <Button
              variant="outline"
              className="w-full text-destructive hover:bg-destructive/10"
              onClick={clearAllAlerts}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Notifications
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
