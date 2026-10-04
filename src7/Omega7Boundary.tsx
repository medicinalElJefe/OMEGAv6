import {Component,type ErrorInfo,type ReactNode} from 'react';

type Props={children:ReactNode;label:string;onRecover?:()=>void};
type State={error:string};

export class Omega7Boundary extends Component<Props,State>{
 state:State={error:''};
 static getDerivedStateFromError(error:unknown){
  return{error:error instanceof Error?error.message:String(error)};
 }
 componentDidCatch(error:unknown,info:ErrorInfo){
  console.error('OMEGA7_BOUNDARY',this.props.label,error,info.componentStack);
 }
 isChunkFailure=()=>/dynamically imported module|chunkloaderror|loading chunk|failed to fetch dynamically imported/i.test(this.state.error);
 reset=()=>{
  this.props.onRecover?.();
  if(this.isChunkFailure()){window.location.reload();return}
  this.setState({error:''});
 };
 render(){
  if(this.state.error)return <section className='o7-failure' role='alert' aria-live='assertive' data-omega7-failure={this.props.label}>
   <strong>{this.props.label} could not finish loading.</strong>
   <span>Your OMEGA state was not discarded.</span>
   <code>{this.state.error}</code>
   <button type='button' onClick={this.reset}>{this.isChunkFailure()?'Recover':'Retry'}</button>
  </section>;
  return this.props.children;
 }
}
