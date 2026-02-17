"use client";

import { fetcher } from "@/api/fetcher";
import { useForm } from "@/ui";
import { Button } from "@/ui/components";
import { UpdateUserDto } from "@workspace/lib/dto";
import { isStrongPassword } from "class-validator";
import { Save, Settings as SettingsIcon } from "lucide-react";
import { toast } from "sonner";

interface SettingsProps {
  userId: string;
  currentUsername: string;
}

export function Settings({ currentUsername, userId }: SettingsProps) {
  const form = useForm({
    defaultValues: { username: "", password: "", passwordConfirmation: "" } as Required<UpdateUserDto> & {
      passwordConfirmation: string;
    },
    onSubmit: async ({ value }) => {
      const { ok } = await fetcher(`/v1/users/${userId}`, {
        method: "PATCH",
        credentials: "include",
        body: JSON.stringify({
          username: value.username !== currentUsername ? value.username.trim() || undefined : undefined,
          password: value.password.trim() || undefined,
        } satisfies UpdateUserDto),
      });

      if (ok) {
        toast.success("Changes saved");
        return;
      }

      toast.error("An unexpected error occurred");
    },
  });

  return (
    <main className="min-h-screen w-full bg-zinc-950 px-6 py-8 text-zinc-100">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/40">
            <SettingsIcon className="h-5 w-5 text-zinc-200" />
          </div>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
        <form.AppForm>
          <form.Form className="space-y-5">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h2 className="text-lg font-semibold mb-4">Account</h2>
              <form.AppField name="username">
                {(field) => <field.Input id="username" label="Username" placeholder={currentUsername} />}
              </form.AppField>
            </section>
            <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <h2 className="text-lg font-semibold mb-4">Security</h2>
              <div className="grid gap-4">
                <form.AppField name="password">
                  {(field) => {
                    const password = field.state.value?.trim();
                    const isStrong = isStrongPassword(password);

                    return (
                      <div className="space-y-2">
                        <field.Input id="password" label="Password" type="password" placeholder="Optional" />
                        {password && (
                          <p className={`text-xs ${isStrong ? "text-emerald-400" : "text-amber-400"}`}>
                            Password strength: {isStrong ? "Strong" : "Weak"}
                          </p>
                        )}
                      </div>
                    );
                  }}
                </form.AppField>
                <form.AppField
                  name="passwordConfirmation"
                  validators={{
                    onChangeListenTo: ["password"],
                    onChange: ({ value, fieldApi }) => {
                      const password = fieldApi.form.getFieldValue("password");
                      if (password && value !== password) {
                        return "Passwords do not match";
                      }
                      return undefined;
                    },
                  }}
                >
                  {(field) => (
                    <field.Input
                      id="passwordConfirmation"
                      label="Confirm password"
                      type="password"
                      placeholder="Optional"
                    />
                  )}
                </form.AppField>
              </div>
            </section>
            <div className="mt-6 flex items-center gap-3">
              <form.SubmitButton icon={<Save className="w-4 h-4" />}>Save changes</form.SubmitButton>
              <form.Subscribe selector={(state) => state.isPristine}>
                {(isPristine) => (
                  <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isPristine}>
                    Reset
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </form.Form>
        </form.AppForm>
      </div>
    </main>
  );
}
