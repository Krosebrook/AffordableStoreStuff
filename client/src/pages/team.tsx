import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Users, UserPlus, Shield, Eye, Pencil, Crown, Loader2, Trash2,
  Mail, Clock, CheckCircle, AlertCircle, Building2,
} from "lucide-react";
import type { Team, TeamMember, TeamRole } from "@shared/schema";
import { TEAM_ROLE_PERMISSIONS } from "@shared/schema";

const ROLE_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  owner: { icon: <Crown className="w-4 h-4" />, color: "text-yellow-400", label: "Owner" },
  admin: { icon: <Shield className="w-4 h-4" />, color: "text-purple-400", label: "Admin" },
  editor: { icon: <Pencil className="w-4 h-4" />, color: "text-blue-400", label: "Editor" },
  viewer: { icon: <Eye className="w-4 h-4" />, color: "text-gray-400", label: "Viewer" },
};

export default function TeamPage() {
  const { toast } = useToast();
  const [showInvite, setShowInvite] = useState(false);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [inviteForm, setInviteForm] = useState({ email: "", name: "", role: "viewer" as string });

  const { data: team, isLoading: teamLoading } = useQuery<Team | null>({
    queryKey: ["/api/team"],
  });

  const { data: members = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/members"],
    enabled: !!team,
  });

  const { data: stats } = useQuery<{
    totalMembers: number;
    activeMembers: number;
    pendingInvites: number;
    roleBreakdown: Record<string, number>;
  }>({
    queryKey: ["/api/team/stats"],
    enabled: !!team,
  });

  const createTeamMutation = useMutation({
    mutationFn: async (name: string) => {
      return apiRequest("POST", "/api/team", { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team"] });
      toast({ title: "Team created" });
      setShowCreateTeam(false);
      setTeamName("");
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: { email: string; name: string; role: string }) => {
      return apiRequest("POST", "/api/team/members", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members", "/api/team/stats"] });
      toast({ title: "Invitation sent" });
      setShowInvite(false);
      setInviteForm({ email: "", name: "", role: "viewer" });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      return apiRequest("PATCH", `/api/team/members/${id}`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members", "/api/team/stats"] });
      toast({ title: "Role updated" });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/team/members/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/members", "/api/team/stats"] });
      toast({ title: "Member removed" });
    },
  });

  const activeMembers = members.filter(m => m.status === "active");
  const pendingMembers = members.filter(m => m.status === "pending");

  if (teamLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  // No team yet - show create team UI
  if (!team) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto mt-20 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">Create Your Team</h1>
          <p className="text-muted-foreground">
            Set up a workspace to collaborate with your team. Invite members with different roles to manage your store together.
          </p>
          <div className="space-y-3">
            <Input
              placeholder="Team name (e.g., My Store Team)"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              className="text-center"
            />
            <Button className="w-full" disabled={!teamName.trim() || createTeamMutation.isPending}
              onClick={() => createTeamMutation.mutate(teamName)}>
              {createTeamMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
              Create Team
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">{team.name}</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and permissions
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-2xl font-bold">{stats?.totalMembers || 0}</p>
            <p className="text-xs text-muted-foreground">Total Members</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
            <p className="text-2xl font-bold">{stats?.activeMembers || 0}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <p className="text-2xl font-bold">{stats?.pendingInvites || 0}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <Shield className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold capitalize">{team.plan}</p>
            <p className="text-xs text-muted-foreground">Plan</p>
          </CardContent>
        </Card>
      </div>

      {/* Permissions Overview */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(Object.entries(ROLE_CONFIG) as [string, typeof ROLE_CONFIG[string]][]).map(([role, config]) => (
              <div key={role} className="p-3 rounded-lg bg-muted/30 space-y-2">
                <div className={`flex items-center gap-2 ${config.color}`}>
                  {config.icon}
                  <span className="font-medium text-sm">{config.label}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  {TEAM_ROLE_PERMISSIONS[role as TeamRole]?.map(perm => (
                    <div key={perm} className="flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5 text-green-400" />
                      <span className="capitalize">{perm.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Members */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Active Members ({activeMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No active members yet.</p>
          ) : (
            activeMembers.map(member => {
              const roleConfig = ROLE_CONFIG[member.role] || ROLE_CONFIG.viewer;
              const initials = member.name
                ? member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
                : member.email.slice(0, 2).toUpperCase();

              return (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium">
                      {initials}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{member.name || member.email.split("@")[0]}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role !== "owner" ? (
                      <Select value={member.role} onValueChange={role => updateRoleMutation.mutate({ id: member.id, role })}>
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge className={`${roleConfig.color} bg-yellow-500/10 border-yellow-500/30`}>
                        {roleConfig.icon}
                        <span className="ml-1">{roleConfig.label}</span>
                      </Badge>
                    )}
                    {member.role !== "owner" && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMemberMutation.mutate(member.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingMembers.length > 0 && (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Pending Invitations ({pendingMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingMembers.map(member => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.name || member.email.split("@")[0]}</p>
                    <p className="text-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">{member.role}</Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    <Clock className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeMemberMutation.mutate(member.id)}>
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to collaborate on your store</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="team@example.com"
                value={inviteForm.email}
                onChange={e => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Name (optional)</label>
              <Input
                placeholder="John Doe"
                value={inviteForm.name}
                onChange={e => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={inviteForm.role} onValueChange={v => setInviteForm(prev => ({ ...prev, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin - Full management access</SelectItem>
                  <SelectItem value="editor">Editor - Create and publish content</SelectItem>
                  <SelectItem value="viewer">Viewer - View-only access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" disabled={!inviteForm.email || inviteMutation.isPending}
              onClick={() => inviteMutation.mutate(inviteForm)}>
              {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
