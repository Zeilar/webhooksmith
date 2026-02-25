"use client";

import { useFetcher } from "@/api/fetchers/client";
import { useForm } from "@/ui";
import { PageContainer, PageShell, PageTitle, Panel } from "@/ui/components";
import { PER_PAGE_MAX, PER_PAGE_MIN } from "@workspace/lib/dto/settings/constants";
import type { UpdateSettingsDto, UpdateUserDto } from "@workspace/lib/dto";
import { Monitor, Save, Settings as SettingsIcon, User } from "lucide-react";
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
  const fetcher = useFetcher();

  const userForm = useForm({
    defaultValues: {
      username: currentUsername,
      password: "",
      passwordConfirmation: "",
    } satisfies UpdateUserDto & { passwordConfirmation: string },
    onSubmit: async ({ value }) => {
      try {
        const username = value.username !== currentUsername ? value.username.trim() || undefined : undefined;
        const password = value.password.trim() || undefined;
        const res = await fetcher(`/v1/users/${userId}`, {
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify({ username, password } satisfies UpdateUserDto),
        });
        if (!res.ok) {
          throw new Error("Failed to save user settings", { cause: res });
        }
        toast.success("User settings saved successfully");
        refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to save user settings");
      }
    },
  });
  const settingsForm = useForm({
    defaultValues: {
      perPage: currentPerPage,
    } satisfies UpdateSettingsDto,
    onSubmit: async ({ value }) => {
      try {
        const res = await fetcher("/v1/settings", {
          method: "PATCH",
          credentials: "include",
          body: JSON.stringify({ perPage: value.perPage } satisfies UpdateSettingsDto),
        });
        if (!res.ok) {
          throw new Error("Failed to save settings", { cause: res });
        }
        toast.success("Settings saved successfully");
        refresh();
      } catch (error) {
        console.error(error);
        toast.error(error instanceof Error ? error.message : "Failed to save settings");
      }
    },
  });

  return (
    <PageShell>
      <PageContainer maxWidthClassName="max-w-xl">
        <PageTitle icon={<SettingsIcon className="h-5 w-5" />} title="Settings" />
        <div className="space-y-8">
          <userForm.AppForm>
            <userForm.Form className="space-y-4">
              <Panel
                title={
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4 text-fuchsia-400" />
                    Account
                  </span>
                }
              >
                <div className="space-y-4">
                  <userForm.AppField name="username">
                    {(field) => <field.Input className="max-w-3xs" label="Username" placeholder={currentUsername} />}
                  </userForm.AppField>
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="flex-1">
                      <userForm.AppField name="password">
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
                      </userForm.AppField>
                    </div>
                    <div className="flex-1">
                      <userForm.AppField
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
                      </userForm.AppField>
                    </div>
                  </div>
                </div>
              </Panel>
              <div className="mt-4 flex items-center gap-4">
                <userForm.SubmitButton icon={<Save className="h-4 w-4" />}>Save user</userForm.SubmitButton>
                <userForm.ResetButton />
              </div>
            </userForm.Form>
          </userForm.AppForm>
          <settingsForm.AppForm>
            <settingsForm.Form className="space-y-4">
              <Panel
                title={
                  <span className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-fuchsia-400" />
                    Display
                  </span>
                }
              >
                <div className="w-full md:w-1/2">
                  <settingsForm.AppField
                    name="perPage"
                    validators={{
                      onChange: ({ value }) => {
                        const parsed = Number(value);
                        return !isFinite(parsed) || parsed < PER_PAGE_MIN || parsed > PER_PAGE_MAX
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
                  </settingsForm.AppField>
                </div>
              </Panel>
              <div className="mt-4 flex items-center gap-4">
                <settingsForm.SubmitButton icon={<Save className="h-4 w-4" />}>Save settings</settingsForm.SubmitButton>
                <settingsForm.ResetButton />
              </div>
            </settingsForm.Form>
          </settingsForm.AppForm>
        </div>
      </PageContainer>
    </PageShell>
  );
}
