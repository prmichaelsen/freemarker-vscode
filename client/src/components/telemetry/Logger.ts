import AWS = require('aws-sdk');
import { InputLogEvent, PutLogEventsRequest } from "aws-sdk/clients/cloudwatchlogs";
import { extensions, version } from 'vscode';
import * as os from 'node:os';
import { putLogEvents } from '../../globals/api';
import { Telemetry } from './Telemetry';
import { qualifiedExtensionId } from '../../globals/constants';

const extension = qualifiedExtensionId;
const user = os.userInfo().username;
const osPlatform = os.type();
const osVersion = os.release();
const vsCodeVersion = version;
const extensionVersion = extensions.getExtension(extension)?.packageJSON.version || 'NOT_FOUND'
export class Logger {
  static log = new AWS.CloudWatchLogs({ 
    apiVersion: '2014-03-28',
    region: 'us-west-2',
  });
  static async publish(data: object) {
    if (Telemetry.enabled === false) {
      return;
    }
    const logEvents: InputLogEvent[] = [
      {
        timestamp: new Date().getTime(),
        message: JSON.stringify({
          user,
          extension,
          vsCodeVersion,
          extensionVersion,
          osPlatform,
          osVersion,
          ...data,
        }),
      }
    ]; 
    const params: PutLogEventsRequest = {
      logGroupName: "FreeMarkerVsCode",
      logStreamName: "Default",
      logEvents,
    }
    try {
      await fetch(putLogEvents, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
    } catch (e) {
    }
  }
}