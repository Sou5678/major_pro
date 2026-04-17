"use client";

import { useState, useEffect } from "react";
import { GitBranch, Plus, Edit2, Trash2, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ResumeVersion } from "@/types";

interface VersionManagerProps {
  resumeId: string;
}

export function VersionManager({ resumeId }: VersionManagerProps) {
  const [versions, setVersions] = useState<ResumeVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    versionName: "",
    targetRole: "",
    description: "",
  });

  useEffect(() => {
    async function fetchVersions() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/resume/${resumeId}/versions`);
        const result = await response.json();

        if (result.success) {
          setVersions(result.data);
        }
      } catch (error) {
        console.error("Error fetching versions:", error);
        toast.error("Failed to load versions");
      } finally {
        setIsLoading(false);
      }
    }

    void fetchVersions();
  }, [resumeId]);

  const handleCreate = async () => {
    if (!formData.versionName.trim() || !formData.targetRole.trim()) {
      toast.error("Version name and target role are required");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`/api/resume/${resumeId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setVersions([result.data, ...versions]);
        setFormData({ versionName: "", targetRole: "", description: "" });
        toast.success("Version created successfully");
      } else {
        toast.error(result.error?.message ?? "Failed to create version");
      }
    } catch (error) {
      console.error("Error creating version:", error);
      toast.error("Failed to create version");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (versionId: string) => {
    if (!formData.versionName.trim() || !formData.targetRole.trim()) {
      toast.error("Version name and target role are required");
      return;
    }

    try {
      const response = await fetch(`/api/resume/versions/${versionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setVersions(versions.map((v) => (v.id === versionId ? result.data : v)));
        setEditingId(null);
        setFormData({ versionName: "", targetRole: "", description: "" });
        toast.success("Version updated successfully");
      } else {
        toast.error(result.error?.message ?? "Failed to update version");
      }
    } catch (error) {
      console.error("Error updating version:", error);
      toast.error("Failed to update version");
    }
  };

  const handleDelete = async (versionId: string) => {
    if (!confirm("Are you sure you want to delete this version?")) {
      return;
    }

    try {
      const response = await fetch(`/api/resume/versions/${versionId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setVersions(versions.filter((v) => v.id !== versionId));
        toast.success("Version deleted successfully");
      } else {
        toast.error(result.error?.message ?? "Failed to delete version");
      }
    } catch (error) {
      console.error("Error deleting version:", error);
      toast.error("Failed to delete version");
    }
  };

  const startEdit = (version: ResumeVersion) => {
    setEditingId(version.id);
    setFormData({
      versionName: version.versionName,
      targetRole: version.targetRole,
      description: version.description,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ versionName: "", targetRole: "", description: "" });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5">
            <GitBranch className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <CardTitle className="text-xl">Resume Versions</CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              Create and manage multiple versions for different job targets
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Version Form */}
        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-4 space-y-3">
          <h3 className="font-semibold text-text-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Version
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Version name (e.g., Frontend Developer)"
              value={formData.versionName}
              onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
            />
            <Input
              placeholder="Target role (e.g., Senior Frontend Engineer)"
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
            />
            <Input
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Button
              onClick={handleCreate}
              disabled={isCreating || !formData.versionName.trim() || !formData.targetRole.trim()}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Version
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Versions List */}
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-accent" />
            <p className="text-sm text-text-secondary mt-2">Loading versions...</p>
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center py-8">
            <GitBranch className="h-16 w-16 mx-auto text-text-secondary/50 mb-4" />
            <p className="text-sm text-text-secondary">No versions yet. Create your first version above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary">Your Versions</h3>
            {versions.map((version) => (
              <div
                key={version.id}
                className="rounded-2xl border border-border bg-surface-elevated p-4"
              >
                {editingId === version.id ? (
                  <div className="space-y-3">
                    <Input
                      placeholder="Version name"
                      value={formData.versionName}
                      onChange={(e) => setFormData({ ...formData, versionName: e.target.value })}
                    />
                    <Input
                      placeholder="Target role"
                      value={formData.targetRole}
                      onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                    />
                    <Input
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdate(version.id)}
                        size="sm"
                        className="flex-1"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEdit}
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-text-primary">{version.versionName}</h4>
                          <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
                            {version.targetRole}
                          </Badge>
                        </div>
                        {version.description && (
                          <p className="text-sm text-text-secondary">{version.description}</p>
                        )}
                        <p className="text-xs text-text-secondary mt-2">
                          Created {new Date(version.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => startEdit(version)}
                          size="sm"
                          variant="secondary"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(version.id)}
                          size="sm"
                          variant="secondary"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
