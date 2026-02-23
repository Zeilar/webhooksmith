"use client";

import { fetcher, FetcherResult } from "@/api/fetcher";
import { useForm } from "@/ui";
import { PageContainer, PageShell, PageTitle } from "@/ui/components";
import { PER_PAGE_MAX, PER_PAGE_MIN } from "@workspace/lib/dto/settings/constants";
import type { UpdateSettingsDto, UpdateUserDto } from "@workspace/lib/dto";
import { Monitor, Save, Settings as SettingsIcon, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { isStrongPassword } from "class-validator";
import { toast } from "sonner";
import classNames from "classnames";

interface SettingsProps {
  userId: string;
  currentUsername: string;
  currentPerPage: number;
}

export function Settings({ currentPerPage, currentUsername, userId }: SettingsProps) {
  const { refresh } = useRouter();

  const form = useForm({
    defaultValues: {
      userId,
      username: currentUsername,
      password: "",
      passwordConfirmation: "",
      perPage: currentPerPage,
    } satisfies UpdateUserDto & UpdateSettingsDto & { passwordConfirmation: string; userId: string },
    onSubmit: async ({ value }) => {
      const username = value.username !== currentUsername ? value.username.trim() || undefined : undefined;
      const password = value.password.trim() || undefined;

      const shouldUpdateUser = Boolean(username || password);
      const shouldUpdateSettings = value.perPage !== currentPerPage;

      const requests: Array<Promise<FetcherResult>> = [];

      if (shouldUpdateUser) {
        requests.push(
          fetcher(`/v1/users/${userId}`, {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify({ username, password } satisfies UpdateUserDto),
          }),
        );
      }

      if (shouldUpdateSettings) {
        requests.push(
          fetcher("/v1/settings", {
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify({ perPage: value.perPage } satisfies UpdateSettingsDto),
          }),
        );
      }

      await Promise.all(requests);

      toast.success("Settings saves successfully");

      refresh();
    },
  });

  return (
    <PageShell>
      <PageContainer>
        <PageTitle icon={<SettingsIcon className="h-5 w-5" />} title="Settings" className="mb-6" />
        <form.AppForm>
          <form.Form className="space-y-5">
            <section className="rounded-2xl border border-slate-700/75 bg-slate-950/25 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <User className="h-4 w-4 text-fuchsia-400" />
                Account
              </h2>
              <div className="max-w-sm space-y-4">
                <form.AppField name="userId">{(field) => <field.Input label="Id" readOnly disabled />}</form.AppField>
                <form.AppField name="username">
                  {(field) => <field.Input label="Username" placeholder={currentUsername} />}
                </form.AppField>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-700/75 bg-slate-950/25 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Shield className="h-4 w-4 text-fuchsia-400" />
                Security
              </h2>
              <div className="flex flex-col gap-4 max-w-sm">
                <form.AppField name="password">
                  {(field) => {
                    const password = field.state.value?.trim();
                    const isStrong = isStrongPassword(password);

                    return (
                      <div className="space-y-2">
                        <field.Input label="Password" type="password" placeholder="Optional" />
                        {password && (
                          <p className={classNames("text-xs", isStrong ? "text-emerald-400" : "text-amber-400")}>
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
                      return password && value !== password ? "Passwords do not match" : undefined;
                    },
                  }}
                >
                  {(field) => <field.Input label="Confirm password" type="password" placeholder="Optional" />}
                </form.AppField>
              </div>
            </section>
            <section className="rounded-2xl border border-slate-700/75 bg-slate-950/25 p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Monitor className="h-4 w-4 text-fuchsia-400" />
                Display
              </h2>
              <div className="w-full md:w-1/2">
                <form.AppField
                  name="perPage"
                  validators={{
                    onChange: ({ value }) => {
                      const parsed = Number(value);
                      return !Number.isFinite(parsed) || parsed < PER_PAGE_MIN || parsed > PER_PAGE_MAX
                        ? `Must be between ${PER_PAGE_MIN} and ${PER_PAGE_MAX}`
                        : undefined;
                    },
                  }}
                >
                  {(field) => (
                    <field.Input
                      inputClassName="w-20!"
                      label="Webhooks per page"
                      type="number"
                      min={PER_PAGE_MIN}
                      max={PER_PAGE_MAX}
                    />
                  )}
                </form.AppField>
              </div>
            </section>
            <div className="mt-6 flex items-center gap-3">
              <form.SubmitButton icon={<Save className="w-4 h-4" />}>Save changes</form.SubmitButton>
              <form.ResetButton />
            </div>
          </form.Form>
        </form.AppForm>
      </PageContainer>
    </PageShell>
  );
}
