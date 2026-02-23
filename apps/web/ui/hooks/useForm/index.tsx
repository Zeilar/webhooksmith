"use client";

import { createFormHook } from "@tanstack/react-form";

import { Editor, Form, Input, Select, SubmitButton, Switch, TextArea, FieldLabel, ResetButton } from "./components";
import { fieldContext, formContext } from "./context";

export const { useAppForm: useForm, withForm } = createFormHook({
  fieldComponents: {
    Editor,
    Input,
    Select,
    Switch,
    TextArea,
    FieldLabel,
  },
  formComponents: {
    SubmitButton,
    Form,
    ResetButton,
  },
  fieldContext,
  formContext,
});
