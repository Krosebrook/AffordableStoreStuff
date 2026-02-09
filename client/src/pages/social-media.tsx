import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Instagram, Music, Youtube, Linkedin, Aperture, Plus, Loader2,
  CheckCircle, XCircle, Send, Calendar, FileText, BarChart3, Eye,
  Heart, MessageCircle, Share2, Users, TrendingUp, Clock,
} from "lucide-react";
import type { SocialPlatform, SocialContent as SocialContentType, SocialPlatformType } from "@shared/schema";
import { SOCIAL_PLATFORM_INFO } from "@shared/schema";

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  tiktok: <Music className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  pinterest: <Aperture className="w-5 h-5" />,
};

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  draft: { color: "bg-gray-500", icon: <FileText className="w-3 h-3" /> },
  scheduled: { color: "bg-blue-500", icon: <Calendar className="w-3 h-3" /> },
  published: { color: "bg-green-500", icon: <CheckCircle className="w-3 h-3" /> },
  failed: { color: "bg-red-500", icon: <XCircle className="w-3 h-3" /> },
};

export default function SocialMedia() {
  const { toast } = useToast();
  const [showConnect, setShowConnect] = useState(false);
  const [showCreateContent, setShowCreateContent] = useState(false);
  const [contentFilter, setContentFilter] = useState("all");
  const [connectForm, setConnectForm] = useState({ platform: "" as string, username: "", displayName: "" });
  const [contentForm, setContentForm] = useState({ title: "", caption: "", platforms: [] as string[] });

  const { data: platforms = [] } = useQuery<SocialPlatform[]>({
    queryKey: ["/api/social/platforms"],
  });

  const { data: content = [] } = useQuery<SocialContentType[]>({
    queryKey: ["/api/social/content"],
  });

  const { data: stats } = useQuery<{ total: number; drafts: number; scheduled: number; published: number; failed: number }>({
    queryKey: ["/api/social/stats"],
  });

  const { data: analyticsSummary } = useQuery<{
    totalPosts: number;
    publishedPosts: number;
    scheduledPosts: number;
    failedPosts: number;
    platformBreakdown: { platform: string; count: number }[];
    recentActivity: { date: string; count: number }[];
  }>({
    queryKey: ["/api/social/analytics/summary"],
  });

  const { data: followerData = [] } = useQuery<
    { platform: string; username: string; followers: number; connected: boolean }[]
  >({
    queryKey: ["/api/social/analytics/followers"],
  });

  const connectMutation = useMutation({
    mutationFn: async (data: { platform: string; username: string; displayName: string }) => {
      return apiRequest("POST", "/api/social/platforms", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/platforms"] });
      toast({ title: "Platform connected" });
      setShowConnect(false);
      setConnectForm({ platform: "", username: "", displayName: "" });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/social/platforms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/platforms"] });
      toast({ title: "Platform disconnected" });
    },
  });

  const createContentMutation = useMutation({
    mutationFn: async (data: { title: string; caption: string; platforms: string[] }) => {
      return apiRequest("POST", "/api/social/content", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", "/api/social/stats"] });
      toast({ title: "Content created" });
      setShowCreateContent(false);
      setContentForm({ title: "", caption: "", platforms: [] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("POST", `/api/social/content/${id}/publish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", "/api/social/stats"] });
      toast({ title: "Content published" });
    },
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/social/content/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/social/content", "/api/social/stats"] });
      toast({ title: "Content deleted" });
    },
  });

  const connectedPlatforms = platforms.filter(p => p.connected);
  const totalFollowers = connectedPlatforms.reduce((sum, p) => sum + (p.followerCount || 0), 0);
  const filteredContent = contentFilter === "all" ? content : content.filter(c => c.status === contentFilter);

  const allPlatformTypes = Object.keys(SOCIAL_PLATFORM_INFO) as SocialPlatformType[];
  const unconnectedPlatforms = allPlatformTypes.filter(
    pt => !platforms.find(p => p.platform === pt && p.connected)
  );

  const togglePlatformInContent = (platform: string) => {
    setContentForm(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Social Media</h1>
          <p className="text-muted-foreground mt-1">
            Manage platforms, create content, and track performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowConnect(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Connect Platform
          </Button>
          <Button onClick={() => setShowCreateContent(true)}>
            <Send className="w-4 h-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-2xl font-bold">{connectedPlatforms.length}</p>
            <p className="text-xs text-muted-foreground">Platforms</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-400" />
            <p className="text-2xl font-bold">{totalFollowers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <FileText className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold">{stats?.drafts || 0}</p>
            <p className="text-xs text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <Calendar className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
            <p className="text-2xl font-bold">{stats?.scheduled || 0}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-emerald-400" />
            <p className="text-2xl font-bold">{stats?.published || 0}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="platforms" className="space-y-4">
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="content">Content ({content.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Platforms Tab */}
        <TabsContent value="platforms" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPlatformTypes.map(platformType => {
              const info = SOCIAL_PLATFORM_INFO[platformType];
              const connection = platforms.find(p => p.platform === platformType && p.connected);

              return (
                <Card key={platformType} className={`glass transition-all ${connection ? "border-green-500/30" : "border-muted"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: info.color + "20" }}>
                          {PLATFORM_ICONS[platformType]}
                        </div>
                        <div>
                          <h3 className="font-medium">{info.name}</h3>
                          {connection && <p className="text-xs text-muted-foreground">@{connection.username}</p>}
                        </div>
                      </div>
                      {connection ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Connected</Badge>
                      ) : (
                        <Badge variant="outline">Not connected</Badge>
                      )}
                    </div>
                    {connection ? (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          {(connection.followerCount || 0).toLocaleString()} followers
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => disconnectMutation.mutate(connection.id)}>
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => {
                        setConnectForm({ platform: platformType, username: "", displayName: "" });
                        setShowConnect(true);
                      }}>
                        <Plus className="w-3 h-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2">
            {["all", "draft", "scheduled", "published", "failed"].map(filter => (
              <Button
                key={filter}
                variant={contentFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setContentFilter(filter)}
              >
                <span className="capitalize">{filter}</span>
                {filter !== "all" && stats && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {stats[filter === "draft" ? "drafts" : filter as keyof typeof stats] || 0}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {filteredContent.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <Send className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No content yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Create your first post to get started.</p>
                <Button className="mt-4" onClick={() => setShowCreateContent(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map(item => {
                const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
                return (
                  <Card key={item.id} className="glass">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{item.title}</h3>
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                          {statusCfg.icon}
                          <span className="capitalize">{item.status}</span>
                        </Badge>
                      </div>
                      {item.caption && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.caption}</p>
                      )}
                      <div className="flex gap-1 flex-wrap">
                        {item.platforms?.map(p => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {PLATFORM_ICONS[p] || p}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <div className="flex gap-1">
                          {item.status === "draft" && (
                            <Button size="sm" variant="ghost" onClick={() => publishMutation.mutate(item.id)}>
                              <Send className="w-3 h-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteContentMutation.mutate(item.id)}>
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {connectedPlatforms.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">Connect platforms to see analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">Connect at least one social platform to view performance data.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="glass">
                  <CardContent className="p-4 text-center">
                    <FileText className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                    <p className="text-2xl font-bold">{analyticsSummary?.totalPosts || 0}</p>
                    <p className="text-xs text-muted-foreground">Total Posts</p>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4 text-center">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-400" />
                    <p className="text-2xl font-bold">{analyticsSummary?.publishedPosts || 0}</p>
                    <p className="text-xs text-muted-foreground">Published</p>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                    <p className="text-2xl font-bold">{analyticsSummary?.scheduledPosts || 0}</p>
                    <p className="text-xs text-muted-foreground">Scheduled</p>
                  </CardContent>
                </Card>
                <Card className="glass">
                  <CardContent className="p-4 text-center">
                    <XCircle className="w-5 h-5 mx-auto mb-1 text-red-400" />
                    <p className="text-2xl font-bold">{analyticsSummary?.failedPosts || 0}</p>
                    <p className="text-xs text-muted-foreground">Failed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Breakdown */}
                {(analyticsSummary?.platformBreakdown?.length ?? 0) > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Posts by Platform</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analyticsSummary!.platformBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="platform" tick={{ fill: '#888', fontSize: 12 }} />
                          <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {analyticsSummary!.platformBreakdown.map((_, index) => (
                              <Cell key={index} fill={["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"][index % 5]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* 30-Day Activity */}
                {(analyticsSummary?.recentActivity?.length ?? 0) > 0 && (
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">30-Day Posting Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={analyticsSummary!.recentActivity}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                          <YAxis tick={{ fill: '#888', fontSize: 12 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Follower Cards */}
              {followerData.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Followers by Platform
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {followerData.map((p) => (
                      <Card key={p.platform} className="glass">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            {PLATFORM_ICONS[p.platform]}
                            <CardTitle className="text-sm">{SOCIAL_PLATFORM_INFO[p.platform as SocialPlatformType]?.name || p.platform}</CardTitle>
                          </div>
                          <CardDescription>@{p.username}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Followers</span>
                            <span className="font-medium">{p.followers.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Connect Platform Dialog */}
      <Dialog open={showConnect} onOpenChange={setShowConnect}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Platform</DialogTitle>
            <DialogDescription>Link your social media account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Select value={connectForm.platform} onValueChange={v => setConnectForm(prev => ({ ...prev, platform: v }))}>
                <SelectTrigger><SelectValue placeholder="Select platform" /></SelectTrigger>
                <SelectContent>
                  {allPlatformTypes.map(pt => (
                    <SelectItem key={pt} value={pt}>{SOCIAL_PLATFORM_INFO[pt].name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input
                placeholder="@username"
                value={connectForm.username}
                onChange={e => setConnectForm(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input
                placeholder="Your display name"
                value={connectForm.displayName}
                onChange={e => setConnectForm(prev => ({ ...prev, displayName: e.target.value }))}
              />
            </div>
            <Button className="w-full" disabled={!connectForm.platform || !connectForm.username || connectMutation.isPending}
              onClick={() => connectMutation.mutate(connectForm)}>
              {connectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Connect
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Content Dialog */}
      <Dialog open={showCreateContent} onOpenChange={setShowCreateContent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
            <DialogDescription>Create content for your social platforms</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="Post title"
                value={contentForm.title}
                onChange={e => setContentForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Caption</label>
              <Textarea
                placeholder="Write your post caption..."
                value={contentForm.caption}
                onChange={e => setContentForm(prev => ({ ...prev, caption: e.target.value }))}
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Target Platforms</label>
              <div className="flex gap-2 flex-wrap">
                {connectedPlatforms.map(p => (
                  <Button
                    key={p.id}
                    variant={contentForm.platforms.includes(p.platform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatformInContent(p.platform)}
                  >
                    {PLATFORM_ICONS[p.platform]}
                    <span className="ml-1">{SOCIAL_PLATFORM_INFO[p.platform as SocialPlatformType]?.name}</span>
                  </Button>
                ))}
                {connectedPlatforms.length === 0 && (
                  <p className="text-xs text-muted-foreground">Connect a platform first to create content.</p>
                )}
              </div>
            </div>
            <Button className="w-full" disabled={!contentForm.title || contentForm.platforms.length === 0 || createContentMutation.isPending}
              onClick={() => createContentMutation.mutate(contentForm)}>
              {createContentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Create Draft
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
