# # main design
# import streamlit as st
# import torch
# import soundfile as sf
# import io
# from df.enhance import enhance, init_df

# model, df_state, _ = init_df()


# st.title("🎧 DeepFilterNet2 - Noise Reduction & Speech Enhancement")

# st.write("Upload an audio file (WAV preferred, 16-bit, 16kHz–48kHz).")

# uploaded_file = st.file_uploader("Upload audio", type=["wav", "mp3", "flac"])

# if uploaded_file is not None:
#     # Read audio
#     data, samplerate = sf.read(uploaded_file)
#     st.audio(uploaded_file)

#     # Load model (DeepFilterNet2) - no device argument
#     st.write("Loading model... ⏳")
#     model, df_state, _ = init_df()
    
#     # Move model to GPU if available
#     device = "cuda" if torch.cuda.is_available() else "cpu"
#     model = model.to(device)
#     st.write(f"Using device: {device}")

#     st.write("Processing audio... ⏳")
    
#     # Convert audio to torch tensor and move to device
#     audio_tensor = torch.from_numpy(data).float()
#     if len(audio_tensor.shape) == 1:
#         audio_tensor = audio_tensor.unsqueeze(0)  # Add batch dimension
    
#     enhanced = enhance(model, df_state, audio_tensor)
    
#     # Convert back to numpy
#     enhanced_audio = enhanced.cpu().numpy().squeeze()

#     # Save enhanced audio to buffer
#     output_buffer = io.BytesIO()
#     sf.write(output_buffer, enhanced_audio, samplerate, format="WAV")
#     output_buffer.seek(0)
    
#     st.success("✅ Processing complete!")
#     st.audio(output_buffer)

#     # Download link
#     st.download_button(
#         label="📥 Download Enhanced Audio",
#         data=output_buffer.getvalue(),
#         file_name="enhanced.wav",
#         mime="audio/wav"
#     )

# import streamlit as st
# import torch
# import soundfile as sf
# import numpy as np
# import io
# from df.enhance import enhance, init_df
# from scipy import signal
# import librosa

# st.title("🎧 DeepFilterNet2 - Advanced Audio Enhancement")

# # Sidebar controls
# st.sidebar.header("⚙️ Audio Controls")

# # Processing mode
# mode = st.sidebar.radio("Processing Mode", ["Single File", "Real-time Simulation"])

# # Frequency adjustment controls
# st.sidebar.subheader("🎚️ Frequency Adjustments")
# bass_gain = st.sidebar.slider("Bass (20-250 Hz)", -12.0, 12.0, 0.0, 0.5)
# mid_gain = st.sidebar.slider("Mids (250-4000 Hz)", -12.0, 12.0, 0.0, 0.5)
# treble_gain = st.sidebar.slider("Treble (4000+ Hz)", -12.0, 12.0, 0.0, 0.5)

# # Advanced settings
# st.sidebar.subheader("🔧 Advanced")
# chunk_size = st.sidebar.select_slider("Chunk Size (for streaming)", 
#                                        options=[0.5, 1.0, 2.0, 3.0, 5.0], 
#                                        value=2.0)
# noise_reduction_strength = st.sidebar.slider("Noise Reduction Strength", 0.0, 2.0, 1.0, 0.1)

# def apply_eq(audio, sr, bass_db, mid_db, treble_db):
#     """Apply 3-band equalizer"""
#     if bass_db == 0 and mid_db == 0 and treble_db == 0:
#         return audio
    
#     # Design filters
#     nyquist = sr / 2
    
#     # Bass: Low-pass filter at 250 Hz
#     bass_b, bass_a = signal.butter(2, 250/nyquist, btype='low')
#     bass = signal.filtfilt(bass_b, bass_a, audio)
    
#     # Mids: Band-pass filter 250-4000 Hz
#     mid_b, mid_a = signal.butter(2, [250/nyquist, 4000/nyquist], btype='band')
#     mids = signal.filtfilt(mid_b, mid_a, audio)
    
#     # Treble: High-pass filter at 4000 Hz
#     treble_b, treble_a = signal.butter(2, 4000/nyquist, btype='high')
#     treble = signal.filtfilt(treble_b, treble_a, audio)
    
#     # Apply gains (dB to linear)
#     bass *= 10 ** (bass_db / 20)
#     mids *= 10 ** (mid_db / 20)
#     treble *= 10 ** (treble_db / 20)
    
#     # Combine
#     result = bass + mids + treble
    
#     # Normalize to prevent clipping
#     max_val = np.abs(result).max()
#     if max_val > 1.0:
#         result = result / max_val * 0.95
    
#     return result

# def process_audio_chunk(audio_chunk, model, df_state, sr):
#     """Process a single chunk of audio"""
#     # DeepFilterNet enhancement
#     audio_tensor = torch.from_numpy(audio_chunk).float()
#     if len(audio_tensor.shape) == 1:
#         audio_tensor = audio_tensor.unsqueeze(0)
    
#     enhanced = enhance(model, df_state, audio_tensor)
#     enhanced_audio = enhanced.cpu().numpy().squeeze()
    
#     # Apply noise reduction strength
#     if noise_reduction_strength != 1.0:
#         enhanced_audio = audio_chunk + (enhanced_audio - audio_chunk) * noise_reduction_strength
    
#     # Apply EQ
#     enhanced_audio = apply_eq(enhanced_audio, sr, bass_gain, mid_gain, treble_gain)
    
#     return enhanced_audio

# # Initialize model once
# @st.cache_resource
# def load_model():
#     st.info("Loading DeepFilterNet2 model...")
#     model, df_state, _ = init_df()
#     device = "cuda" if torch.cuda.is_available() else "cpu"
#     model = model.to(device)
#     st.success(f"✅ Model loaded on {device}")
#     return model, df_state

# model, df_state = load_model()

# if mode == "Single File":
#     st.write("Upload an audio file for enhancement")
#     uploaded_file = st.file_uploader("Upload audio", type=["wav", "mp3", "flac", "ogg"])
    
#     if uploaded_file is not None:
#         # Read audio
#         data, samplerate = sf.read(uploaded_file)
        
#         col1, col2 = st.columns(2)
#         with col1:
#             st.subheader("🎵 Original Audio")
#             st.audio(uploaded_file)
            
#         with col2:
#             st.subheader("✨ Enhanced Audio")
            
#             with st.spinner("Processing... ⏳"):
#                 # Process entire file
#                 enhanced_audio = process_audio_chunk(data, model, df_state, samplerate)
                
#                 # Save to buffer
#                 output_buffer = io.BytesIO()
#                 sf.write(output_buffer, enhanced_audio, samplerate, format="WAV")
#                 output_buffer.seek(0)
                
#                 st.audio(output_buffer)
                
#                 # Download button
#                 st.download_button(
#                     label="📥 Download Enhanced Audio",
#                     data=output_buffer.getvalue(),
#                     file_name="enhanced.wav",
#                     mime="audio/wav"
#                 )
        
#         # Audio analysis
#         st.subheader("📊 Audio Analysis")
#         col1, col2, col3 = st.columns(3)
        
#         with col1:
#             st.metric("Sample Rate", f"{samplerate} Hz")
#         with col2:
#             duration = len(data) / samplerate
#             st.metric("Duration", f"{duration:.2f} sec")
#         with col3:
#             channels = "Mono" if len(data.shape) == 1 else f"{data.shape[1]}-channel"
#             st.metric("Channels", channels)

# else:  # Real-time Simulation
#     st.write("Upload an audio file to simulate real-time processing with chunking")
#     uploaded_file = st.file_uploader("Upload audio", type=["wav", "mp3", "flac", "ogg"], key="realtime")
    
#     if uploaded_file is not None:
#         data, samplerate = sf.read(uploaded_file)
        
#         st.subheader("🎵 Original Audio")
#         st.audio(uploaded_file)
        
#         st.subheader("🔄 Real-time Simulation")
#         st.info(f"Processing in {chunk_size}s chunks to simulate streaming...")
        
#         # Calculate chunk size in samples
#         chunk_samples = int(chunk_size * samplerate)
#         num_chunks = int(np.ceil(len(data) / chunk_samples))
        
#         # Progress bar
#         progress_bar = st.progress(0)
#         status_text = st.empty()
        
#         # Process chunks
#         enhanced_chunks = []
#         for i in range(num_chunks):
#             start_idx = i * chunk_samples
#             end_idx = min((i + 1) * chunk_samples, len(data))
#             chunk = data[start_idx:end_idx]
            
#             # Process chunk
#             enhanced_chunk = process_audio_chunk(chunk, model, df_state, samplerate)
#             enhanced_chunks.append(enhanced_chunk)
            
#             # Update progress
#             progress = (i + 1) / num_chunks
#             progress_bar.progress(progress)
#             status_text.text(f"Processing chunk {i+1}/{num_chunks} ({progress*100:.1f}%)")
        
#         # Combine chunks
#         enhanced_audio = np.concatenate(enhanced_chunks)
        
#         status_text.success("✅ Processing complete!")
#         progress_bar.empty()
        
#         st.subheader("✨ Enhanced Audio")
#         output_buffer = io.BytesIO()
#         sf.write(output_buffer, enhanced_audio, samplerate, format="WAV")
#         output_buffer.seek(0)
#         st.audio(output_buffer)
        
#         st.download_button(
#             label="📥 Download Enhanced Audio",
#             data=output_buffer.getvalue(),
#             file_name="enhanced_realtime.wav",
#             mime="audio/wav"
#         )
        
#         # Show processing stats
#         st.subheader("📈 Processing Statistics")
#         col1, col2, col3 = st.columns(3)
#         with col1:
#             st.metric("Total Chunks", num_chunks)
#         with col2:
#             st.metric("Chunk Duration", f"{chunk_size}s")
#         with col3:
#             total_time = len(data) / samplerate
#             st.metric("Total Duration", f"{total_time:.2f}s")

# # Footer
# st.markdown("---")
# st.markdown("💡 **Tips:**")
# st.markdown("- Adjust frequency bands to enhance voice clarity or reduce specific noise types")
# st.markdown("- Use Real-time Simulation to see how streaming would work with your audio")
# st.markdown("- Smaller chunks = more responsive but slightly more processing overhead")


# import streamlit as st
# import torch
# import soundfile as sf
# import numpy as np
# import io
# from df.enhance import enhance, init_df
# from scipy import signal
# import time

# # Audio recording libraries
# try:
#     import sounddevice as sd
#     from scipy.io.wavfile import write
#     AUDIO_AVAILABLE = True
# except ImportError:
#     AUDIO_AVAILABLE = False
#     st.warning("⚠️ Install sounddevice: `pip install sounddevice`")

# st.title("🎧 DeepFilterNet2 - Real-Time Audio Enhancement")

# # Sidebar controls
# st.sidebar.header("⚙️ Audio Controls")

# # Processing mode
# mode = st.sidebar.radio("Processing Mode", ["File Upload", "Real-Time Microphone"])

# # Frequency adjustment controls
# st.sidebar.subheader("🎚️ Frequency Adjustments")
# bass_gain = st.sidebar.slider("Bass (20-250 Hz)", -12.0, 12.0, 0.0, 0.5)
# mid_gain = st.sidebar.slider("Mids (250-4000 Hz)", -12.0, 12.0, 0.0, 0.5)
# treble_gain = st.sidebar.slider("Treble (4000+ Hz)", -12.0, 12.0, 0.0, 0.5)

# # Real-time settings
# if mode == "Real-Time Microphone":
#     st.sidebar.subheader("🎙️ Real-Time Settings")
#     sample_rate = st.sidebar.selectbox("Sample Rate", [16000, 24000, 48000], index=1)
#     duration = st.sidebar.slider("Recording Duration (seconds)", 2, 10, 5, 1)

# def apply_eq(audio, sr, bass_db, mid_db, treble_db):
#     """Apply 3-band equalizer"""
#     if bass_db == 0 and mid_db == 0 and treble_db == 0:
#         return audio
    
#     nyquist = sr / 2
    
#     # Bass: Low-pass filter at 250 Hz
#     bass_b, bass_a = signal.butter(2, 250/nyquist, btype='low')
#     bass = signal.filtfilt(bass_b, bass_a, audio)
    
#     # Mids: Band-pass filter 250-4000 Hz
#     mid_b, mid_a = signal.butter(2, [250/nyquist, 4000/nyquist], btype='band')
#     mids = signal.filtfilt(mid_b, mid_a, audio)
    
#     # Treble: High-pass filter at 4000 Hz
#     treble_b, treble_a = signal.butter(2, 4000/nyquist, btype='high')
#     treble = signal.filtfilt(treble_b, treble_a, audio)
    
#     # Apply gains
#     bass *= 10 ** (bass_db / 20)
#     mids *= 10 ** (mid_db / 20)
#     treble *= 10 ** (treble_db / 20)
    
#     result = bass + mids + treble
    
#     # Normalize
#     max_val = np.abs(result).max()
#     if max_val > 1.0:
#         result = result / max_val * 0.95
    
#     return result

# def process_audio_chunk(audio_chunk, model, df_state, sr):
#     """Process a single chunk of audio"""
#     try:
#         # DeepFilterNet enhancement
#         audio_tensor = torch.from_numpy(audio_chunk).float()
#         if len(audio_tensor.shape) == 1:
#             audio_tensor = audio_tensor.unsqueeze(0)
        
#         enhanced = enhance(model, df_state, audio_tensor)
#         enhanced_audio = enhanced.cpu().numpy().squeeze()
        
#         # Apply EQ
#         enhanced_audio = apply_eq(enhanced_audio, sr, bass_gain, mid_gain, treble_gain)
        
#         return enhanced_audio
#     except Exception as e:
#         st.error(f"Processing error: {e}")
#         return audio_chunk

# # Initialize model once
# @st.cache_resource
# def load_model():
#     st.info("Loading DeepFilterNet2 model...")
#     model, df_state, _ = init_df()
#     device = "cuda" if torch.cuda.is_available() else "cpu"
#     model = model.to(device)
#     st.success(f"✅ Model loaded on {device}")
#     return model, df_state

# model, df_state = load_model()

# # FILE UPLOAD MODE
# if mode == "File Upload":
#     st.write("Upload an audio file for enhancement")
#     uploaded_file = st.file_uploader("Upload audio", type=["wav", "mp3", "flac", "ogg"])
    
#     if uploaded_file is not None:
#         data, samplerate = sf.read(uploaded_file)
        
#         col1, col2 = st.columns(2)
#         with col1:
#             st.subheader("🎵 Original Audio")
#             st.audio(uploaded_file)
            
#         with col2:
#             st.subheader("✨ Enhanced Audio")
            
#             with st.spinner("Processing... ⏳"):
#                 enhanced_audio = process_audio_chunk(data, model, df_state, samplerate)
                
#                 output_buffer = io.BytesIO()
#                 sf.write(output_buffer, enhanced_audio, samplerate, format="WAV")
#                 output_buffer.seek(0)
                
#                 st.audio(output_buffer)
                
#                 st.download_button(
#                     label="📥 Download Enhanced Audio",
#                     data=output_buffer.getvalue(),
#                     file_name="enhanced.wav",
#                     mime="audio/wav"
#                 )

# # REAL-TIME MICROPHONE MODE
# else:
#     if not AUDIO_AVAILABLE:
#         st.error("❌ Please install sounddevice: `pip install sounddevice`")
#         st.stop()
    
#     st.write("### 🎙️ Real-Time Audio Enhancement")
#     st.info(f"Click 'Record' to capture {duration} seconds of audio. It will be processed and played back immediately.")
    
#     # Initialize session state
#     if 'recordings' not in st.session_state:
#         st.session_state.recordings = []
    
#     col1, col2, col3 = st.columns(3)
    
#     with col1:
#         record_button = st.button("🎙️ Record Audio")
    
#     with col2:
#         clear_button = st.button("🗑️ Clear All")
#         if clear_button:
#             st.session_state.recordings = []
#             st.rerun()
    
#     with col3:
#         if st.session_state.recordings:
#             # Combine all recordings for download
#             all_enhanced = np.concatenate([rec['enhanced'] for rec in st.session_state.recordings])
#             buffer = io.BytesIO()
#             sf.write(buffer, all_enhanced, sample_rate, format="WAV")
#             st.download_button(
#                 "📥 Download All",
#                 buffer.getvalue(),
#                 "all_enhanced.wav",
#                 "audio/wav"
#             )
    
#     # Recording process
#     if record_button:
#         with st.spinner(f"🔴 Recording for {duration} seconds... Speak now!"):
#             try:
#                 # Record audio
#                 recording = sd.rec(int(duration * sample_rate), 
#                                   samplerate=sample_rate, 
#                                   channels=1, 
#                                   dtype='float32')
#                 sd.wait()  # Wait for recording to finish
                
#                 audio_flat = recording.flatten()
                
#                 st.success("✅ Recording complete! Processing...")
                
#                 # Process the recording
#                 with st.spinner("🔄 Enhancing audio..."):
#                     enhanced = process_audio_chunk(audio_flat, model, df_state, sample_rate)
                
#                 # Store recording
#                 st.session_state.recordings.append({
#                     'original': audio_flat,
#                     'enhanced': enhanced,
#                     'timestamp': time.strftime("%H:%M:%S")
#                 })
                
#                 st.rerun()
                
#             except Exception as e:
#                 st.error(f"Recording error: {e}")
    
#     # Display recordings
#     if st.session_state.recordings:
#         st.write("---")
#         st.subheader("📼 Recorded & Enhanced Audio")
        
#         for idx, rec in enumerate(reversed(st.session_state.recordings)):
#             with st.expander(f"Recording {len(st.session_state.recordings) - idx} - {rec['timestamp']}", expanded=(idx==0)):
#                 col1, col2 = st.columns(2)
                
#                 with col1:
#                     st.write("**🎤 Original**")
#                     orig_buffer = io.BytesIO()
#                     sf.write(orig_buffer, rec['original'], sample_rate, format="WAV")
#                     orig_buffer.seek(0)
#                     st.audio(orig_buffer)
                
#                 with col2:
#                     st.write("**✨ Enhanced**")
#                     enh_buffer = io.BytesIO()
#                     sf.write(enh_buffer, rec['enhanced'], sample_rate, format="WAV")
#                     enh_buffer.seek(0)
#                     st.audio(enh_buffer)
                
#                 # Individual download
#                 download_buffer = io.BytesIO()
#                 sf.write(download_buffer, rec['enhanced'], sample_rate, format="WAV")
#                 st.download_button(
#                     f"📥 Download Recording {len(st.session_state.recordings) - idx}",
#                     download_buffer.getvalue(),
#                     f"enhanced_{len(st.session_state.recordings) - idx}.wav",
#                     "audio/wav",
#                     key=f"download_{idx}"
#                 )
#     else:
#         st.info("👆 Click 'Record Audio' to start capturing and enhancing your voice!")

# # Footer
# st.markdown("---")
# st.markdown("💡 **How Real-Time Mode Works:**")
# st.markdown(f"1. Click **Record Audio** button")
# st.markdown(f"2. Speak for {duration} seconds (recording starts immediately)")
# st.markdown("3. Audio is automatically processed with DeepFilterNet3")
# st.markdown("4. Compare original vs enhanced side-by-side")
# st.markdown("5. Adjust EQ sliders and record again to hear the difference!")