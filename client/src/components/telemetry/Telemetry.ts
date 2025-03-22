import { Dimension, MetricData } from 'aws-sdk/clients/cloudwatch';
import * as os from 'node:os';
import { extensions, version } from 'vscode';
import { Logger } from './Logger';
import { putMetricData } from '../../globals/api';
import { qualifiedExtensionId } from '../../globals/constants';

const userMetric = 'User';
const vsVersionMetric = 'VsCodeVersion';
const extensionVersionMetric = 'ExtensionVersion';
const extension = qualifiedExtensionId;
const username = os.userInfo().username;
const vsCodeVersion = version;
const extensionVersion = extension + "@" + extensions.getExtension(extension)?.packageJSON.version || 'NOT_FOUND'
const Namespace = "FreeMarkerVsCode";
const userDimension: Dimension = { Name: userMetric, Value: username };
const vsCodeVersionDimension: Dimension = { Name: vsVersionMetric, Value: vsCodeVersion };
const extensionVersionDimension: Dimension = { Name: extensionVersionMetric, Value: extensionVersion };
export class Telemetry {
  static enabled: boolean = true;
  static getDefaultDimensions(): Dimension[] {
    return [
      userDimension, vsCodeVersionDimension, extensionVersionDimension,
    ];
  }

  static async publish(metricData: MetricData) {
    if (Telemetry.enabled === false) {
      return;
    }
    try {
      const _metricData: MetricData = [];
      for (const datum of metricData) {
        const { Dimensions = [], ...rest } = datum;
        Logger.publish({
          data: Dimensions.reduce((prev, { Name, Value }) => ({...prev, [Name]: Value }), {}),
          ...rest,
        });
        // Aggregate
        _metricData.push({
          ...datum,
        });
      }
      console.log(`freemarker-vscode: Publishing metrics ${JSON.stringify(_metricData)}`);
      await fetch(putMetricData, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          MetricData: _metricData,
          Namespace,
        })
      });
    } catch (e) {}
  }
}