"use client";

import { useFetcher } from "@/api/fetchers/client";
import { useRouter } from "next/navigation";
import { useForm } from "@/ui";
import { PageContainer, PageShell, Panel } from "@/ui/components";
import type { SignInDto } from "@workspace/lib/dto";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

export function SignIn() {
  const { refresh } = useRouter();
  const fetcher = useFetcher();
  const form = useForm({
    defaultValues: { username: "", password: "" } satisfies SignInDto,
    onSubmit: async ({ value, formApi }) => {
      const { ok, status } = await fetcher("/v1/auth/sign-in", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(value),
      });
      if (ok) {
        toast.success("Signed in");
        refresh();
        return;
      }
      if (status === 401) {
        formApi.setErrorMap({ onChange: { fields: { password: "Incorrect password" } } });
        return;
      }
      if (status === 404) {
        formApi.setErrorMap({ onChange: { fields: { username: "User does not exist." } } });
        return;
      }
      toast.error("An unexpected error occurred");
      formApi.setErrorMap({ onChange: { fields: { password: "An unexpected error occurred." } } });
    },
  });

  return (
    <PageShell>
      <PageContainer maxWidthClassName="max-w-sm" className="flex min-h-[calc(100svh-10rem)] items-center">
        <form.AppForm>
          <form.Form className="w-full">
            <Panel
              title={
                <span className="flex items-center gap-2">
                  <LogIn className="h-4 w-4 text-fuchsia-400" />
                  Sign in
                </span>
              }
            >
              <div className="space-y-4">
                <form.AppField
                  name="username"
                  validators={{
                    // Clear existing API errors
                    onChange: ({ fieldApi }) => {
                      fieldApi.setErrorMap({});
                    },
                  }}
                >
                  {(field) => <field.Input label="Username" required />}
                </form.AppField>
                <form.AppField
                  name="password"
                  validators={{
                    // Clear existing API errors
                    onChange: ({ fieldApi }) => {
                      fieldApi.setErrorMap({});
                    },
                  }}
                >
                  {(field) => <field.Input label="Password" type="password" required />}
                </form.AppField>
                <form.SubmitButton className="w-full">Sign in</form.SubmitButton>
              </div>
            </Panel>
          </form.Form>
        </form.AppForm>
      </PageContainer>
    </PageShell>
  );
}
