"use client";

import { fetcher } from "@/api/fetcher";
import { useRouter } from "next/navigation";
import { useForm } from "@/ui";
import { PageContainer, PageShell } from "@/ui/components";
import type { SignInDto } from "@workspace/lib/dto";
import { toast } from "sonner";

export function SignIn() {
  const { refresh } = useRouter();
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
      <PageContainer maxWidthClassName="max-w-md" className="flex min-h-[calc(100vh-10rem)] items-center">
        <form.AppForm>
          <form.Form className="w-full space-y-4 rounded-2xl border border-slate-700/75 bg-slate-900/55 p-6 shadow-xl shadow-slate-950/20 backdrop-blur-sm">
            <h1 className="text-xl font-semibold">Sign in</h1>
            <form.AppField
              name="username"
              validators={{
                // Clear existing API errors so that submit button is
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
                // Clear existing API errors so that submit button is
                onChange: ({ fieldApi }) => {
                  fieldApi.setErrorMap({});
                },
              }}
            >
              {(field) => <field.Input label="Password" type="password" required />}
            </form.AppField>
            <form.SubmitButton className="w-full">Sign in</form.SubmitButton>
          </form.Form>
        </form.AppForm>
      </PageContainer>
    </PageShell>
  );
}
