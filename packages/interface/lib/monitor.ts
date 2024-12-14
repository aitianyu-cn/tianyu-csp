/** @format */

/** Monitor Supported Status Type */
export type MonitorStatusType = string | number | (string | number)[];

/** CSP Monitor API for global */
export interface IMonitor {
    /**
     * To save a new status
     *
     * @param monitorGroup Monitor group name to indicate the category
     * @param monitorName Monitor recorder name for specified function
     * @param monitorStatus thr status what to save
     */
    save(monitorGroup: string, monitorName: string, monitorStatus: MonitorStatusType): void;
}
