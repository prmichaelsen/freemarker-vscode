import { Metrics } from "./Metrics";
import { Telemetry } from "./Telemetry";

export interface Fatal {
  error: any;
  context?: object;
}
export class Fatals {
  static async publishError(fatal: Fatal) {
    await this._publish(fatal, 'Error');
  }

  static async publishFatal(fatal: Fatal) {
    await this._publish(fatal, 'Fatal');
  }

  private static async _publish(fatal: Fatal, type: 'Fatal' | 'Error') {
    const { 
      error, 
      context = {},
    } = fatal;
    Telemetry.publish([{
      MetricName: type,
      Unit: 'Count',
      Value: 1,
      Dimensions: [
        {
          Name: Metrics.Dimensions.Body,
          Value: JSON.stringify(error)
        },
        {
          Name: Metrics.Dimensions.Context,
          Value: JSON.stringify(context)
        },
      ],
    }]);
  }
}