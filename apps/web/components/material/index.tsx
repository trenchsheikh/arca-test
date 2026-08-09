'use client';

import React from 'react';
import { createComponent } from '@lit/react';
import { MdFilledButton as MdFilledButtonEl } from '@material/web/button/filled-button.js';
import { MdOutlinedButton as MdOutlinedButtonEl } from '@material/web/button/outlined-button.js';
import { MdTextButton as MdTextButtonEl } from '@material/web/button/text-button.js';
import { MdFilledTonalButton as MdFilledTonalButtonEl } from '@material/web/button/filled-tonal-button.js';
import { MdOutlinedTextField as MdOutlinedTextFieldEl } from '@material/web/textfield/outlined-text-field.js';
import { MdFilledTextField as MdFilledTextFieldEl } from '@material/web/textfield/filled-text-field.js';
import { MdCheckbox as MdCheckboxEl } from '@material/web/checkbox/checkbox.js';
import { MdCircularProgress as MdCircularProgressEl } from '@material/web/progress/circular-progress.js';
import { MdLinearProgress as MdLinearProgressEl } from '@material/web/progress/linear-progress.js';
import { MdFilterChip as MdFilterChipEl } from '@material/web/chips/filter-chip.js';
import { MdAssistChip as MdAssistChipEl } from '@material/web/chips/assist-chip.js';
import { MdSuggestionChip as MdSuggestionChipEl } from '@material/web/chips/suggestion-chip.js';
import { MdChipSet as MdChipSetEl } from '@material/web/chips/chip-set.js';
import { MdList as MdListEl } from '@material/web/list/list.js';
import { MdListItem as MdListItemEl } from '@material/web/list/list-item.js';
import { MdIcon as MdIconEl } from '@material/web/icon/icon.js';
import { MdIconButton as MdIconButtonEl } from '@material/web/iconbutton/icon-button.js';
import { MdFilledIconButton as MdFilledIconButtonEl } from '@material/web/iconbutton/filled-icon-button.js';
import { MdOutlinedIconButton as MdOutlinedIconButtonEl } from '@material/web/iconbutton/outlined-icon-button.js';
import { MdTabs as MdTabsEl } from '@material/web/tabs/tabs.js';
import { MdPrimaryTab as MdPrimaryTabEl } from '@material/web/tabs/primary-tab.js';
import { MdSecondaryTab as MdSecondaryTabEl } from '@material/web/tabs/secondary-tab.js';
import { MdOutlinedSelect as MdOutlinedSelectEl } from '@material/web/select/outlined-select.js';
import { MdSelectOption as MdSelectOptionEl } from '@material/web/select/select-option.js';
import { MdDivider as MdDividerEl } from '@material/web/divider/divider.js';
import { MdSwitch as MdSwitchEl } from '@material/web/switch/switch.js';
import { MdRadio as MdRadioEl } from '@material/web/radio/radio.js';
import { MdDialog as MdDialogEl } from '@material/web/dialog/dialog.js';
import { MdSlider as MdSliderEl } from '@material/web/slider/slider.js';
import { MdFab as MdFabEl } from '@material/web/fab/fab.js';

export const MdFilledButton = createComponent({
  react: React,
  tagName: 'md-filled-button',
  elementClass: MdFilledButtonEl,
  events: { onClick: 'click' },
});

export const MdOutlinedButton = createComponent({
  react: React,
  tagName: 'md-outlined-button',
  elementClass: MdOutlinedButtonEl,
  events: { onClick: 'click' },
});

export const MdTextButton = createComponent({
  react: React,
  tagName: 'md-text-button',
  elementClass: MdTextButtonEl,
  events: { onClick: 'click' },
});

export const MdFilledTonalButton = createComponent({
  react: React,
  tagName: 'md-filled-tonal-button',
  elementClass: MdFilledTonalButtonEl,
  events: { onClick: 'click' },
});

export const MdOutlinedTextField = createComponent({
  react: React,
  tagName: 'md-outlined-text-field',
  elementClass: MdOutlinedTextFieldEl,
  events: {
    onInput: 'input',
    onChange: 'change',
  },
});

export const MdFilledTextField = createComponent({
  react: React,
  tagName: 'md-filled-text-field',
  elementClass: MdFilledTextFieldEl,
  events: {
    onInput: 'input',
    onChange: 'change',
  },
});

export const MdCheckbox = createComponent({
  react: React,
  tagName: 'md-checkbox',
  elementClass: MdCheckboxEl,
  events: { onChange: 'change', onClick: 'click' },
});

export const MdCircularProgress = createComponent({
  react: React,
  tagName: 'md-circular-progress',
  elementClass: MdCircularProgressEl,
});

export const MdLinearProgress = createComponent({
  react: React,
  tagName: 'md-linear-progress',
  elementClass: MdLinearProgressEl,
});

export const MdFilterChip = createComponent({
  react: React,
  tagName: 'md-filter-chip',
  elementClass: MdFilterChipEl,
  events: { onClick: 'click' },
});

export const MdAssistChip = createComponent({
  react: React,
  tagName: 'md-assist-chip',
  elementClass: MdAssistChipEl,
  events: { onClick: 'click' },
});

export const MdSuggestionChip = createComponent({
  react: React,
  tagName: 'md-suggestion-chip',
  elementClass: MdSuggestionChipEl,
  events: { onClick: 'click' },
});

export const MdChipSet = createComponent({
  react: React,
  tagName: 'md-chip-set',
  elementClass: MdChipSetEl,
});

export const MdList = createComponent({
  react: React,
  tagName: 'md-list',
  elementClass: MdListEl,
});

export const MdListItem = createComponent({
  react: React,
  tagName: 'md-list-item',
  elementClass: MdListItemEl,
  events: { onClick: 'click' },
});

export const MdIcon = createComponent({
  react: React,
  tagName: 'md-icon',
  elementClass: MdIconEl,
});

export const MdIconButton = createComponent({
  react: React,
  tagName: 'md-icon-button',
  elementClass: MdIconButtonEl,
  events: { onClick: 'click' },
});

export const MdFilledIconButton = createComponent({
  react: React,
  tagName: 'md-filled-icon-button',
  elementClass: MdFilledIconButtonEl,
  events: { onClick: 'click' },
});

export const MdOutlinedIconButton = createComponent({
  react: React,
  tagName: 'md-outlined-icon-button',
  elementClass: MdOutlinedIconButtonEl,
  events: { onClick: 'click' },
});

export const MdTabs = createComponent({
  react: React,
  tagName: 'md-tabs',
  elementClass: MdTabsEl,
  events: { onChange: 'change' },
});

export const MdPrimaryTab = createComponent({
  react: React,
  tagName: 'md-primary-tab',
  elementClass: MdPrimaryTabEl,
  events: { onClick: 'click' },
});

export const MdSecondaryTab = createComponent({
  react: React,
  tagName: 'md-secondary-tab',
  elementClass: MdSecondaryTabEl,
  events: { onClick: 'click' },
});

export const MdOutlinedSelect = createComponent({
  react: React,
  tagName: 'md-outlined-select',
  elementClass: MdOutlinedSelectEl,
  events: { onChange: 'change', onInput: 'input' },
});

export const MdSelectOption = createComponent({
  react: React,
  tagName: 'md-select-option',
  elementClass: MdSelectOptionEl,
});

export const MdDivider = createComponent({
  react: React,
  tagName: 'md-divider',
  elementClass: MdDividerEl,
});

export const MdSwitch = createComponent({
  react: React,
  tagName: 'md-switch',
  elementClass: MdSwitchEl,
  events: { onChange: 'change' },
});

export const MdRadio = createComponent({
  react: React,
  tagName: 'md-radio',
  elementClass: MdRadioEl,
  events: { onChange: 'change' },
});

export const MdDialog = createComponent({
  react: React,
  tagName: 'md-dialog',
  elementClass: MdDialogEl,
  events: { onClose: 'close', onCancel: 'cancel', onOpen: 'open' },
});

export const MdSlider = createComponent({
  react: React,
  tagName: 'md-slider',
  elementClass: MdSliderEl,
  events: { onChange: 'change', onInput: 'input' },
});

export const MdFab = createComponent({
  react: React,
  tagName: 'md-fab',
  elementClass: MdFabEl,
  events: { onClick: 'click' },
});
