# import streamlit as st
# import torch
# import soundfile as sf
# import numpy as np
# import io
# from df.enhance import enhance, init_df
# from scipy import signal
# import socket
# import time

# st.set_page_config(page_title="Real-Time Audio", layout="wide")

# # Get local IP for network access
# def get_local_ip():
#     try:
#         s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
#         s.connect(("8.8.8.8", 80))
#         ip = s.getsockname()[0]
#         s.close()
#         return ip
#     except:
#         return "localhost"

# # Initialize session state for audio buffer
# if 'audio_buffer' not in st.session_state:
#     st.session_state.audio_buffer = []
# if 'role' not in st.session_state:
#     st.session_state.role = None

# # Load model once
# @st.cache_resource
# def load_model():
#     model, df_state, _ = init_df()
#     device = "cuda" if torch.cuda.is_available() else "cpu"
#     model = model.to(device)
#     return model, df_state, device

# # EQ function
# def apply_eq(audio, sr, bass_db, mid_db, treble_db):
#     if bass_db == 0 and mid_db == 0 and treble_db == 0:
#         return audio
    
#     nyquist = sr / 2
#     bass_b, bass_a = signal.butter(2, 250/nyquist, btype='low')
#     bass = signal.filtfilt(bass_b, bass_a, audio)
    
#     mid_b, mid_a = signal.butter(2, [250/nyquist, 4000/nyquist], btype='band')
#     mids = signal.filtfilt(mid_b, mid_a, audio)
    
#     treble_b, treble_a = signal.butter(2, 4000/nyquist, btype='high')
#     treble = signal.filtfilt(treble_b, treble_a, audio)
    
#     bass *= 10 ** (bass_db / 20)
#     mids *= 10 ** (mid_db / 20)
#     treble *= 10 ** (treble_db / 20)
    
#     result = bass + mids + treble
#     max_val = np.abs(result).max()
#     if max_val > 1.0:
#         result = result / max_val * 0.95
    
#     return result

# # Main UI
# st.title("🎧 DeepFilterNet2 - Network Audio System")

# # Show network info
# local_ip = get_local_ip()
# st.info(f"🌐 **Network Access:** Open `http://{local_ip}:8501` on any device in your network")

# # Role selection
# st.write("---")
# col1, col2, col3 = st.columns(3)

# with col1:
#     if st.button("📱 I'm the PHONE (Input)", use_container_width=True):
#         st.session_state.role = "phone"
#         st.rerun()

# with col2:
#     if st.button("💻 I'm the LAPTOP (Output)", use_container_width=True):
#         st.session_state.role = "laptop"
#         st.rerun()

# with col3:
#     if st.button("📁 File Upload Mode", use_container_width=True):
#         st.session_state.role = "file"
#         st.rerun()

# st.write("---")

# # PHONE MODE (Input Device)
# if st.session_state.role == "phone":
#     st.header("📱 Phone Mode - Audio Input")
#     st.write("This device will record and send audio to the laptop")
    
#     # Audio recording component
#     audio_value = st.audio_input("🎤 Record Audio")
    
#     if audio_value is not None:
#         # Read the recorded audio
#         data, samplerate = sf.read(audio_value)
        
#         st.success(f"✅ Recorded {len(data)/samplerate:.2f} seconds")
        
#         # Save to session state buffer (shared across devices via server)
#         if st.button("📤 Send to Laptop for Processing"):
#             # Store in session state
#             st.session_state.audio_buffer.append({
#                 'data': data,
#                 'samplerate': samplerate,
#                 'timestamp': time.time()
#             })
#             st.success("✅ Audio sent! Check laptop device.")
#             st.rerun()
    
#     st.info("💡 **Tip:** After recording, click 'Send to Laptop' to process the audio")

# # LAPTOP MODE (Output Device)
# elif st.session_state.role == "laptop":
#     st.header("💻 Laptop Mode - Audio Output")
#     st.write("This device will receive and play clean audio")
    
#     # EQ Controls
#     with st.sidebar:
#         st.subheader("🎚️ Equalizer")
#         bass_gain = st.slider("Bass", -12.0, 12.0, 0.0, 0.5)
#         mid_gain = st.slider("Mids", -12.0, 12.0, 0.0, 0.5)
#         treble_gain = st.slider("Treble", -12.0, 12.0, 0.0, 0.5)
    
#     # Load model
#     with st.spinner("Loading model..."):
#         model, df_state, device = load_model()
#     st.success(f"✅ Model ready on {device}")
    
#     # Check for incoming audio
#     if st.button("🔄 Check for New Audio", use_container_width=True):
#         st.rerun()
    
#     if st.session_state.audio_buffer:
#         st.success(f"📨 Received {len(st.session_state.audio_buffer)} audio file(s)")
        
#         for idx, audio_item in enumerate(st.session_state.audio_buffer):
#             with st.expander(f"Audio {idx + 1} - {time.strftime('%H:%M:%S', time.localtime(audio_item['timestamp']))}", expanded=True):
#                 data = audio_item['data']
#                 samplerate = audio_item['samplerate']
                
#                 col1, col2 = st.columns(2)
                
#                 with col1:
#                     st.write("**🎤 Original (from Phone)**")
#                     orig_buffer = io.BytesIO()
#                     sf.write(orig_buffer, data, samplerate, format="WAV")
#                     orig_buffer.seek(0)
#                     st.audio(orig_buffer)
                
#                 with col2:
#                     st.write("**✨ Enhanced (on Laptop)**")
                    
#                     if st.button(f"🔄 Process Audio {idx + 1}", key=f"process_{idx}"):
#                         with st.spinner("Processing..."):
#                             # Process audio
#                             audio_tensor = torch.from_numpy(data).float()
#                             if len(audio_tensor.shape) == 1:
#                                 audio_tensor = audio_tensor.unsqueeze(0)
                            
#                             enhanced = enhance(model, df_state, audio_tensor)
#                             enhanced_audio = enhanced.cpu().numpy().squeeze()
                            
#                             # Apply EQ
#                             enhanced_audio = apply_eq(enhanced_audio, samplerate, 
#                                                      bass_gain, mid_gain, treble_gain)
                            
#                             # Store processed audio
#                             audio_item['enhanced'] = enhanced_audio
#                             st.rerun()
                    
#                     # Show enhanced if available
#                     if 'enhanced' in audio_item:
#                         enh_buffer = io.BytesIO()
#                         sf.write(enh_buffer, audio_item['enhanced'], samplerate, format="WAV")
#                         enh_buffer.seek(0)
#                         st.audio(enh_buffer)
                        
#                         st.download_button(
#                             "📥 Download Enhanced",
#                             enh_buffer.getvalue(),
#                             f"enhanced_{idx + 1}.wav",
#                             "audio/wav",
#                             key=f"download_{idx}"
#                         )
        
#         if st.button("🗑️ Clear All Audio"):
#             st.session_state.audio_buffer = []
#             st.rerun()
    
#     else:
#         st.info("📭 No audio received yet. Record on phone and send here.")
#         st.write("Waiting for audio from phone...")
        
#         # Auto-refresh every 5 seconds
#         st_autorefresh = st.empty()
#         with st_autorefresh:
#             if st.button("🔄 Auto-refresh in 5s"):
#                 time.sleep(5)
#                 st.rerun()

# # FILE UPLOAD MODE
# elif st.session_state.role == "file":
#     st.header("📁 File Upload Mode")
    
#     with st.sidebar:
#         st.subheader("🎚️ Equalizer")
#         bass_gain = st.slider("Bass", -12.0, 12.0, 0.0, 0.5)
#         mid_gain = st.slider("Mids", -12.0, 12.0, 0.0, 0.5)
#         treble_gain = st.slider("Treble", -12.0, 12.0, 0.0, 0.5)
    
#     model, df_state, device = load_model()
    
#     uploaded_file = st.file_uploader("Upload audio", type=["wav", "mp3", "flac"])
    
#     if uploaded_file:
#         data, samplerate = sf.read(uploaded_file)
        
#         col1, col2 = st.columns(2)
        
#         with col1:
#             st.subheader("🎵 Original")
#             st.audio(uploaded_file)
        
#         with col2:
#             st.subheader("✨ Enhanced")
#             with st.spinner("Processing..."):
#                 audio_tensor = torch.from_numpy(data).float()
#                 if len(audio_tensor.shape) == 1:
#                     audio_tensor = audio_tensor.unsqueeze(0)
                
#                 enhanced = enhance(model, df_state, audio_tensor)
#                 enhanced_audio = enhanced.cpu().numpy().squeeze()
#                 enhanced_audio = apply_eq(enhanced_audio, samplerate, 
#                                          bass_gain, mid_gain, treble_gain)
                
#                 output_buffer = io.BytesIO()
#                 sf.write(output_buffer, enhanced_audio, samplerate, format="WAV")
#                 output_buffer.seek(0)
                
#                 st.audio(output_buffer)
#                 st.download_button("📥 Download", output_buffer.getvalue(), 
#                                   "enhanced.wav", "audio/wav")

# else:
#     st.info("👆 **Choose your device role above to get started**")
#     st.write("### How it works:")
#     st.markdown("""
#     1. **On Phone:** Select "I'm the PHONE", record audio, and send
#     2. **On Laptop:** Select "I'm the LAPTOP", receive and process audio
#     3. Both devices access the same app via your local network!
    
#     **Network Setup:**
#     - Make sure both devices are on the same WiFi
#     - Phone opens: `http://{local_ip}:8501`
#     - Laptop opens: `http://localhost:8501` or same network URL
#     """)

# # Footer
# st.write("---")
# st.caption(f"💡 Network IP: {local_ip}:8501 | Device Role: {st.session_state.role or 'Not Selected'}")