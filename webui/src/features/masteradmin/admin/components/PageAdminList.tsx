// src/features/admin/components/PageAdminList.tsx
/**
 * Admin list view displaying pages in a card-based layout with management actions.
 * Supports edit and delete operations with confirmation dialogs.
 */

"use client";

import { Page } from "@/features/pages/types/page";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, ExternalLink, Globe } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface PageAdminListProps {
  pages: Page[];
  onEdit: (page: Page) => void;
  onDelete: (id: string) => Promise<void>;
  isDeleting?: string | null;
}

export function PageAdminList({ pages, onEdit, onDelete, isDeleting }: PageAdminListProps) {
  if (pages.length === 0) {
    return (
      <div className="text-center py-16 border-2 border-dashed border-border rounded-xl bg-muted/50">
        <p className="text-muted-foreground">No pages found. Create your first page to get started.</p>
      </div>
    );
  }

  const isExternal = (href: string) => href.startsWith("http");

  return (
    <div className="space-y-4">
      {pages.map((page) => (
        <Card key={page.id} className="group hover:border-primary/50 transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {page.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {page.category}
                  </Badge>
                  {isExternal(page.href) && (
                    <Badge variant="outline" className="text-xs gap-1 text-primary border-primary/20 bg-primary/5">
                      <Globe className="h-3 w-3" />
                      External
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm max-w-2xl line-clamp-2">{page.description}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono bg-muted px-2 py-1 rounded">{page.href}</span>
                  <span>•</span>
                  <span>{page.tags.length} tags</span>
                </div>
              </div>

              <div className="flex items-center gap-2 lg:flex-col xl:flex-row">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(page)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="gap-2"
                      disabled={isDeleting === page.id}
                    >
                      {isDeleting === page.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{page.title}"? This action cannot be undone and 
                        will immediately remove the page from the dashboard.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => onDelete(page.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Page
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}