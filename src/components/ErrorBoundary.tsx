import React from 'react'
import { captureException } from '@sentry/react'

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string; stack: any }
> {
  constructor(props) {
    super(props)
    this.state = { error: null, stack: null }
  }

  static getDerivedStateFromError(error) {
    return { error: error.message }
  }

  componentDidCatch(error, info) {
    this.setState({ stack: info.componentStack })

    captureException(error)
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          <code>
            {JSON.stringify(this.state.error, null, 2)}

            <div
              dangerouslySetInnerHTML={{
                __html: this.state.stack?.replace('\n', '<br>'),
              }}
            ></div>
          </code>
        </div>
      )
    }

    return this.props.children
  }
}
