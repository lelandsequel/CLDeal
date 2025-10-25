import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, Clock, FileText, Home as HomeIcon, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Deals() {
  const { user, isAuthenticated } = useAuth();
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);

  const { data: offers, refetch: refetchOffers } = trpc.offers.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: tasks, refetch: refetchTasks } = trpc.tasks.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateTaskMutation = trpc.tasks.update.useMutation({
    onSuccess: () => {
      toast.success("Task updated");
      refetchTasks();
    },
  });

  const deleteTaskMutation = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      toast.success("Task deleted");
      refetchTasks();
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to manage your deals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white shadow-sm">
        <div className="container flex items-center justify-between py-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-xl font-bold">
              <HomeIcon className="h-6 w-6" />
              {APP_TITLE}
            </a>
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <h1 className="mb-6 text-3xl font-bold">Deal Management</h1>

        <Tabs defaultValue="offers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Track and manage your property offers</p>
            </div>

            {offers && offers.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 text-lg font-semibold">No Offers Yet</h3>
                  <p className="text-center text-slate-600">
                    Make an offer on a property from the property detail page
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {offers?.map((offer) => (
                <Card key={offer.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">Property #{offer.propertyId}</CardTitle>
                        <CardDescription>
                          Offer Amount: ${offer.offerAmount.toLocaleString()}
                        </CardDescription>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          offer.status === "accepted"
                            ? "bg-green-100 text-green-700"
                            : offer.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : offer.status === "submitted"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {offer.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {offer.notes && (
                      <p className="text-sm text-slate-600">{offer.notes}</p>
                    )}
                    {offer.closingDate && (
                      <p className="mt-2 text-sm text-slate-600">
                        Closing: {new Date(offer.closingDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-600">Manage inspections, appraisals, and other tasks</p>
            </div>

            {tasks && tasks.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 text-lg font-semibold">No Tasks Yet</h3>
                  <p className="text-center text-slate-600">
                    Create tasks to track your deal progress
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {tasks?.map((task) => (
                <Card key={task.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          updateTaskMutation.mutate({
                            id: task.id,
                            status: task.status === "completed" ? "pending" : "completed",
                          })
                        }
                      >
                        {task.status === "completed" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400" />
                        )}
                      </Button>
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        {task.description && (
                          <p className="text-sm text-slate-600">{task.description}</p>
                        )}
                        <div className="mt-1 flex gap-2">
                          <span className="text-xs text-slate-500 capitalize">{task.taskType.replace("_", " ")}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className={`text-xs font-medium ${
                            task.priority === "urgent" ? "text-red-600" :
                            task.priority === "high" ? "text-orange-600" :
                            task.priority === "medium" ? "text-blue-600" :
                            "text-slate-600"
                          }`}>
                            {task.priority} priority
                          </span>
                          {task.dueDate && (
                            <>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="text-xs text-slate-500">
                                Due {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteTaskMutation.mutate({ id: task.id })}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

