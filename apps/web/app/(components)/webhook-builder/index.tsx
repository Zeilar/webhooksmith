"use client";

import { Activity, useEffect, useRef } from "react";
import {
  Check,
  CircleCheck,
  CircleX,
  Code,
  Copy,
  Eye,
  FileText,
  Link2,
  LoaderCircle,
  Rocket,
  Save,
  Trash2,
  Webhook as WebhookIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, EnabledSegmentedControl, ErrorAlert, Modal, Panel, Required } from "@/ui/components";
import { PageContainer, PageShell, PageTitle } from "@/ui/components";
import { useSocket } from "@/ui";
import { useForm, useDisclosure } from "@/ui/hooks";
import type { CreateWebhookDto, TestWebhookBlueprintDto } from "@workspace/lib/dto";
import { isJSON, isURL } from "class-validator";
import { useFetcher } from "@/api/fetchers/client";
import { createOnSubmit, updateOnSubmit } from "./submitters";

interface WebhookBuilderProps {
  name?: string;
  description?: string;
  receiver?: string;
  blueprint?: string;
  enabled?: boolean;
  interceptId: string;
  createMode: boolean;
}

type SetTimeout = ReturnType<typeof setTimeout>;

export function WebhookBuilder({
  name = "",
  description = "",
  blueprint = "",
  receiver = "",
  enabled = true,
  interceptId,
  createMode,
}: WebhookBuilderProps) {
  const fetcher = useFetcher();
  const params = useParams<{ id: string | undefined }>();
  const { push, refresh } = useRouter();
  const id = params.id;
  const [isCopiedVisible, copied] = useDisclosure();
  const [isTestSuccessVisible, testSuccess] = useDisclosure();
  const [isDeleteModalOpen, deleteModal] = useDisclosure();
  const copyResetTimeoutRef = useRef<SetTimeout | null>(null);
  const testSuccessTimeoutRef = useRef<SetTimeout | null>(null);
  const form = useForm({
    defaultValues: { name, description, receiver, blueprint, enabled, intercepted: "" } satisfies CreateWebhookDto & {
      intercepted: string;
    },
    onSubmit: ({ value }) => {
      const dto: CreateWebhookDto = {
        name: value.name.trim(),
        description: value.description.trim(),
        blueprint: value.blueprint.trim(),
        receiver: value.receiver.trim(),
        enabled: value.enabled,
      };
      if (createMode) {
        return createOnSubmit(fetcher, dto, (id) => push(`/webhooks/${id}`));
      }
      if (!id) {
        toast.error("An unexpected error occurred");
        return;
      }
      return updateOnSubmit(fetcher, id, dto, refresh);
    },
  });
  const socket = useSocket();
  const interceptUrlQuery = useQuery({
    queryKey: ["intercept-url"],
    queryFn: () => `${window.location.origin}/webhooks/intercept/${interceptId}`,
    initialData: "",
  });
  const copyInterceptUrl = async () => {
    await navigator.clipboard.writeText(interceptUrlQuery.data);
    copied.open();
    if (copyResetTimeoutRef.current) {
      clearTimeout(copyResetTimeoutRef.current);
    }
    copyResetTimeoutRef.current = setTimeout(copied.close, 2500);
  };

  useEffect(() => {
    const event = `intercept-${interceptId}`;
    socket.on(event, (data: Record<string, unknown>) => {
      form.setFieldValue("intercepted", JSON.stringify(data, null, 2));
      toast.success("Webhook intercepted");
    });
    return () => {
      socket.off(event);
    };
  }, [socket, form, interceptId]);

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current) {
        clearTimeout(copyResetTimeoutRef.current);
      }
      if (testSuccessTimeoutRef.current) {
        clearTimeout(testSuccessTimeoutRef.current);
      }
    };
  }, []);

  const testMutation = useMutation({
    mutationFn: async () => {
      const receiver = form.getFieldValue("receiver");
      if (!receiver) {
        throw new Error("No receiver configured.");
      }
      const { data, ok, status, statusText } = await fetcher("/webhooks/test-blueprint", {
        method: "POST",
        body: JSON.stringify({
          blueprint: form.getFieldValue("blueprint"),
          intercepted: form.getFieldValue("intercepted"),
          receiver,
        } satisfies TestWebhookBlueprintDto),
      });
      if (!ok) {
        throw new Error(`Error: ${status} ${statusText}`, { cause: data });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { data, ok, status, statusText } = await fetcher(`/webhooks/${id}`, { method: "DELETE" });
      if (!ok) {
        throw new Error(`Error: ${status} ${statusText}`, { cause: data });
      }
    },
    onSuccess: () => {
      toast.success("Webhook deleted");
      push("/");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete webhook");
    },
  });

  useEffect(() => {
    if (!testMutation.isSuccess) {
      return;
    }
    testSuccess.open();
    if (testSuccessTimeoutRef.current) {
      clearTimeout(testSuccessTimeoutRef.current);
    }
    testSuccessTimeoutRef.current = setTimeout(testSuccess.close, 2500);
  }, [testMutation.isSuccess, testSuccess]);

  let testTitle = "Test webhook";
  let testIcon = <WebhookIcon className="h-4 w-4" />;
  if (testMutation.isPending) {
    testTitle = "Testing...";
    testIcon = <LoaderCircle className="h-4 w-4 animate-spin" />;
  } else if (testMutation.isSuccess && isTestSuccessVisible) {
    testTitle = "Test succeeded";
    testIcon = <CircleCheck className="h-4 w-4 text-emerald-400" />;
  } else if (testMutation.isError) {
    testTitle = "Test failed";
    testIcon = <CircleX className="h-4 w-4 text-rose-400" />;
  }

  const testErrorMessage =
    testMutation.isError && testMutation.error instanceof Error ? testMutation.error.message : "Test request failed.";
  const testErrorCause =
    testMutation.isError && testMutation.error instanceof Error && testMutation.error.cause
      ? typeof testMutation.error.cause === "string"
        ? testMutation.error.cause
        : JSON.stringify(testMutation.error.cause, null, 2)
      : null;

  return (
    <form.AppForm>
      <form.Form className="w-full">
        <PageShell>
          <PageContainer>
            <PageTitle
              icon={<WebhookIcon className="h-5 w-5" />}
              title={
                <>
                  Webhook / <span className="text-slate-400">{id ?? "new"}</span>
                </>
              }
            />
            <div className="grid grid-cols-1 gap-4">
              <Panel
                title={
                  <span className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-fuchsia-400" />
                    Details
                  </span>
                }
                headerAction={
                  <form.AppField name="enabled">
                    {(field) => <EnabledSegmentedControl enabled={field.state.value} onChange={field.handleChange} />}
                  </form.AppField>
                }
              >
                <div className="space-y-3">
                  <form.AppField name="name">
                    {(field) => <field.Input className="max-w-md" label="Name" type="text" required />}
                  </form.AppField>
                  <form.AppField name="description">
                    {(field) => <field.TextArea label="Description" rows={3} />}
                  </form.AppField>
                  <form.AppField
                    name="receiver"
                    validators={{
                      onBlur: ({ value }) => (!isURL(value) ? "Must be a valid URL." : undefined),
                    }}
                  >
                    {(field) => (
                      <field.Input
                        placeholder="https://discord.com/api/webhooks/XXXXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                        type="url"
                        label="Receiver"
                        required
                      />
                    )}
                  </form.AppField>
                </div>
              </Panel>
              <Panel
                title={
                  <span className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-fuchsia-400" />
                    Intercept
                  </span>
                }
              >
                <div className="space-y-2">
                  <p className="text-sm text-slate-300">Use this URL in your app to intercept a response</p>
                  {interceptUrlQuery.isPending || interceptUrlQuery.isFetching ? (
                    <span className="inline-flex items-center rounded-md border border-slate-700/75 bg-slate-800/65 px-2 py-1 text-sm text-slate-300">
                      <LoaderCircle className="h-5 w-5 animate-spin" />
                    </span>
                  ) : (
                    <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-700/75 bg-slate-800/65 px-2 py-1 text-sm">
                      <code className="min-w-0 break-all">{interceptUrlQuery.data}</code>
                      <button
                        type="button"
                        onClick={copyInterceptUrl}
                        className="ml-1 shrink-0 rounded p-0.5 transition-colors hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"
                        title={isCopiedVisible ? "Copied" : "Copy"}
                      >
                        {isCopiedVisible ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </span>
                  )}
                </div>
              </Panel>
              <section className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                <Panel
                  title={
                    <span className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-fuchsia-400" />
                      Intercepted response
                    </span>
                  }
                >
                  <form.AppField name="intercepted">
                    {(field) => <field.Editor options={{ readOnly: true }} />}
                  </form.AppField>
                </Panel>
                <form.AppField
                  name="blueprint"
                  validators={{
                    onBlur: ({ value }) => (!isJSON(value) ? "Must be valid JSON." : undefined),
                  }}
                >
                  {(field) => (
                    <Panel
                      title={
                        <span className="flex items-center gap-2">
                          <Code className="h-4 w-4 text-fuchsia-400" />
                          Blueprint <Required />
                        </span>
                      }
                    >
                      <field.Editor />
                    </Panel>
                  )}
                </form.AppField>
              </section>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <form.SubmitButton
                className="h-full"
                icon={createMode ? <Rocket className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              >
                {createMode ? "Submit" : "Save"}
              </form.SubmitButton>
              <form.AppField name="receiver">
                {(receiverField) => (
                  <form.AppField name="intercepted">
                    {(interceptedField) => (
                      <Button
                        type="button"
                        onClick={() => testMutation.mutate()}
                        disabled={
                          testMutation.isPending || !receiverField.state.value || !isJSON(interceptedField.state.value)
                        }
                        title={testTitle}
                        variant="outline"
                      >
                        <span>Test</span>
                        {testIcon}
                      </Button>
                    )}
                  </form.AppField>
                )}
              </form.AppField>
              <Activity mode={!createMode ? "visible" : "hidden"}>
                <Button type="button" variant="danger" className="ml-auto" onClick={deleteModal.open}>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </Activity>
            </div>
            <Activity mode={testMutation.isError ? "visible" : "hidden"}>
              <ErrorAlert
                title="Test request failed"
                message={testErrorMessage}
                cause={testErrorCause}
                className="mt-3"
              />
            </Activity>
          </PageContainer>
        </PageShell>
      </form.Form>
      <Activity mode={!createMode ? "visible" : "hidden"}>
        <Modal
          open={isDeleteModalOpen}
          onClose={deleteModal.close}
          title="Delete webhook?"
          description="This action cannot be undone."
          footer={
            <>
              <Button type="button" variant="ghost" onClick={deleteModal.close}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>Confirm</span>
              </Button>
            </>
          }
        />
      </Activity>
    </form.AppForm>
  );
}
