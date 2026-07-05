import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_#0a0a0f,_#000000)] flex items-center justify-center p-6">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={28} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">發生錯誤</h2>
            <p className="text-gray-400 mb-2 text-sm">{this.state.error.message}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              className="mt-4 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl text-white transition-all">
              重新整理
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
