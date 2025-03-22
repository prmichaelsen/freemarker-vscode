import { ExtensionContext, commands } from 'vscode';
import { Telemetry } from '../components/telemetry/Telemetry';
import { Metrics } from '../components/telemetry/Metrics';

export const telemetryAcceptCompletionCommand = 'freemarker-vscode.telemetry.acceptCompletion'
export const registerTelemetryAcceptCompletionCommand = (context: ExtensionContext) => {
  const dispose = () => null;
  context.subscriptions.push(
    commands.registerCommand(telemetryAcceptCompletionCommand, async (value) => {
      Telemetry.publish([
        {
          MetricName: Metrics.AcceptCompletion,
          Unit: 'Count',
          Value: 1,
        },
        {
          MetricName: Metrics.AcceptCompletion,
          Unit: 'Count',
          Value: 1,
          Dimensions: [{
            Name: 'CompletionItem',
            Value: value,
          }],
        },
      ]);
      return dispose;
    }),
  );
};
