declare namespace youtubeDlNativeMessage {
  interface Data {
    [key: string]: any;
  }

  interface Request {
    type: string;
    data: RequestData;
  }

  type RequestData = StartWorkerRequestData | StopWorkerRequestData | CheckRunningWorkerRequestData | AddQueueRequestData | GetTasksRequestData | GetFailedTasksRequestData | GetTasksByIdsRequestData;
  
  interface StartWorkerRequestData {
    sqlite_path: string;
    pidfile_path: string;
    youtubedl_path: string;
    ffmpeg_path: string;
    log_directory: string;
    browser: string;
    dev?: boolean;
  }
  
  interface StopWorkerRequestData {
    pidfile_path: string;
  }
  
  interface CheckRunningWorkerRequestData {
    pidfile_path: string;
  }
  
  interface AddQueueRequestData {
    sqlite_path: string;
    url: string;
    title: string;
    video_format: string;
    audio_format: string;
    output_path: string;
    parameter: string;
  }
  
  interface GetTasksRequestData {
    sqlite_path: string;
  }
  
  interface GetFailedTasksRequestData {
    sqlite_path: string;
  }

  interface GetTasksByIdsRequestData {
    sqlite_path: string;
    ids: string[];
  }

  interface Response {
    data: ResponseData;
    error: string;
  }

  type ResponseData = null | undefined | number | boolean | Task | Task[] | FailedTask[];

  interface Task {
    [key: string]: any;
    id: string;
    video_format: string;
    audio_format: string;
    url: string;
    title: string;
    output_path: string;
    parameter: string;
    created_at: number;
    updated_at: number;
    started_at: number;
  }

  interface FailedTask {
    [key: string]: any;
    id: string;
    video_format: string;
    audio_format: string;
    url: string;
    title: string;
    output_path: string;
    parameter: string;
    created_at: number;
    updated_at: number;
    started_at: number;
    failed_at: number;
  }
}
