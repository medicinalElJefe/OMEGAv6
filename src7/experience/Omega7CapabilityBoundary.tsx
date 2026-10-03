import React from 'react';

type Props={label:string;children:React.ReactNode;onRetry?:()=>void};
type State={error:Error|null};

export class Omega7CapabilityBoundary extends React.Component<Props,State>{
 state:State={error:null};
 static getDerivedStateFromError(error:Error){return{error}}
 componentDidCatch(error:Error,info:React.ErrorInfo){
  window.dispatchEvent(new CustomEvent('omega7-capability-error',{detail:{label:this.props.label,message:error.message,componentStack:info.componentStack}}));
 }
 render(){
  if(!this.state.error)return this.props.children;
  return <section className='o7-failure' role='alert'>
   <div><b>{this.props.label} could not finish loading.</b><p>Your OMEGA7 workspace is still running. This capability failed in isolation.</p><small>{this.state.error.message}</small></div>
   <div className='o7-failure-actions'>
    <button onClick={()=>{this.setState({error:null});this.props.onRetry?.()}}>Retry</button>
    <button onClick={()=>window.dispatchEvent(new CustomEvent('omega7-open-diagnostics'))}>View diagnostics</button>
   </div>
  </section>
 }
}
