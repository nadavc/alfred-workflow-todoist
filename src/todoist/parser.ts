import todoist from '@/todoist';
import * as grammar from '@/todoist/grammar';
import nearley from 'nearley';

export function parser(text: string) {
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar))

  parser.feed(text)

  return organize(parser.results)
}

/**
 * @hidden
 */
function organize([results]: todoist.Token[][]) {
  // Defaults
  let tokens: { [index: string]: any } = {
    content: '<Give a name to this task>',
    labels: [],
    due_string: '',
    priority: '1'
  }

  results.forEach((token, index) => {
    if (token.type === 'content') {
      if (token.value.trim() !== '') {
        tokens.content += token.value.trim()
        tokens.content = tokens.content.replace('<Give a name to this task>', '')
      }
    } else if (token.type === 'label') {
      tokens.labels.push(token)
    } else if (token.type === 'priority') {
      tokens.priority = '' + (5 - +token.value)
    } else if (token.type === 'date') {
      tokens.due_string = token.value
    } else {
      tokens[token.type] = token
    }

    if (index === results.length - 1) {
      tokens.last = () => token
    }
  })

  return Object.assign(tokens, {
    toJSON(this: todoist.Task) {
      return {
        content: this.content,
        priority: +(this.priority || 1),
        due_string: this.due_string || void 0,
        project: this.project ? `${this.project}` : void 0,
        project_id: this.project_id,
        labels:
          this.labels && this.labels.length > 0 ? this.labels.map(label => `${label}`) : void 0,
        label_ids: (this.label_ids && this.label_ids.length > 0) || void 0
      }
    }
  })
}
