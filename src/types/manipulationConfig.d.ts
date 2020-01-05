declare namespace manipulationConfig {
  export module '*/manipulation.yml' {
    const data: ManipulateConfig;
    export default data;
  }
  
  export interface ManipulationConfig {
    url: Url;
    manipulates: Manipulate[];
  }

  export interface Url {
    pattern: string;
    matchnum: number;
    regexp: RegExp | null;
  }
  
  export interface Manipulate {
    observers: string[];
    query: string;
    attributeName: string;
    currents: TargetAction[];
    parents: TargetAction[];
    children: TargetAction[];
  }

  export interface TargetAction {
    description: string;
    selector: string;
    actions: Action[];
  }

  export interface Action {
    type: string;
  }
}
