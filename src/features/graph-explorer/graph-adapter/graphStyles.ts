import type { StylesheetJson } from 'cytoscape'

import { designTokens } from '@/app/theme/tokens'

export const graphStyles: StylesheetJson = [
  {
    selector: 'node',
    style: {
      width: 48,
      height: 48,
      label: 'data(name)',
      'background-color': designTokens.color.mute,
      'border-color': designTokens.color.card,
      'border-width': 3,
      color: designTokens.color.ink,
      'font-family': designTokens.fontFamily,
      'font-size': 11,
      'font-weight': 700,
      'text-margin-y': 9,
      'text-valign': 'bottom',
    },
  },
  {
    selector: 'node.dense',
    style: {
      width: 18,
      height: 18,
      label: '',
      'font-size': 7,
      'text-margin-y': 3,
      'border-width': 1,
    },
  },
  {
    selector: 'node.dense:selected',
    style: {
      label: 'data(name)',
      width: 24,
      height: 24,
      'font-size': 10,
      'text-margin-y': 6,
      'border-width': 3,
    },
  },
  {
    selector: 'node[status = "deployed"]',
    style: { 'background-color': designTokens.color.brand.main },
  },
  {
    selector: 'node[status = "deploying"]',
    style: { 'background-color': designTokens.color.info },
  },
  {
    selector: 'node[status = "failed"]',
    style: { 'background-color': designTokens.color.destructive },
  },
  {
    selector: 'node[status = "pending"]',
    style: { 'background-color': designTokens.color.mute },
  },
  {
    selector: 'node[status = "decommissioning"]',
    style: { 'background-color': designTokens.color.warning },
  },
  {
    selector: 'edge',
    style: {
      width: 2,
      'line-color': designTokens.color.line,
      'curve-style': 'straight',
    },
  },
  {
    selector: '.related',
    style: {
      'border-color': designTokens.color.ink,
      'border-width': 4,
      'line-color': designTokens.color.ink,
      'z-index': 10,
    },
  },
  {
    selector: '.dimmed',
    style: { opacity: 0.2 },
  },
]
