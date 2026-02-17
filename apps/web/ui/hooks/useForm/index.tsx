"use client";

import { createFormHook } from "@tanstack/react-form";

import { Editor, Form, Input, Select, SubmitButton, TextArea, FieldLabel } from "./components";
import { fieldContext, formContext } from "./context";

export const { useAppForm: useForm, withForm } = createFormHook({
  fieldComponents: {
    Editor,
    Input,
    Select,
    TextArea,
    FieldLabel,
  },
  formComponents: {
    SubmitButton,
    Form,
  },
  fieldContext,
  formContext,
});
