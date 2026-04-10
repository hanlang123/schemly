import type { Component } from 'vue'
import type { DisplayAs, EditAs } from '@schemly/core'
import {
  TextDisplay, NumberDisplay, CurrencyDisplay,
  TagDisplay, StatusDisplay,
  DateDisplay,
  CopyDisplay, LinkDisplay, ProgressDisplay,
  ImageDisplay, FileDisplay,
  DetailDisplay,
} from './display'
import {
  InputEditor, TextareaEditor, InputNumberEditor,
  SelectEditor, RadioEditor, CheckboxEditor,
  DatePickerEditor, DateRangePickerEditor, SwitchEditor,
  ImageUploadEditor, FileUploadEditor,
} from './edit'

export const DISPLAY_RENDERER_MAP: Record<DisplayAs, Component> = {
  text: TextDisplay,
  number: NumberDisplay,
  currency: CurrencyDisplay,
  tag: TagDisplay,
  status: StatusDisplay,
  date: DateDisplay,
  copy: CopyDisplay,
  link: LinkDisplay,
  progress: ProgressDisplay,
  image: ImageDisplay,
  file: FileDisplay,
  detail: DetailDisplay,
}

export const EDIT_RENDERER_MAP: Record<EditAs, Component> = {
  input: InputEditor,
  textarea: TextareaEditor,
  inputNumber: InputNumberEditor,
  select: SelectEditor,
  radio: RadioEditor,
  checkbox: CheckboxEditor,
  datePicker: DatePickerEditor,
  dateRangePicker: DateRangePickerEditor,
  switch: SwitchEditor,
  imageUpload: ImageUploadEditor,
  fileUpload: FileUploadEditor,
}
