declare namespace youtubeDlWorkerServer {
  interface Data {
    [key: string]: any;
  }

  type PostRequestData = GetTaskByIdsRequestData | AddQueueRequestData | null | undefined;

  type GetTaskByIdsRequestData = string[]
  
  interface AddQueueRequestData {
    url: string;
    title: string;
    video_format: string;
    audio_format: string;
    output_directory: string;
    filename: string;
    parameter: string;
  }
  
  interface Response {
    data: ResponseData;
    error: string;
  }

  type ResponseData = null | undefined | string | Task | Task[];

  interface Task {
    [key: string]: any;
    id: string;
    video_format: string;
    audio_format: string;
    url: string;
    title: string;
    output_directory: string;
    filename: string;
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
    output_directory: string;
    filename: string;
    parameter: string;
    created_at: number;
    updated_at: number;
    started_at: number;
    failed_at: number;
  }
}
