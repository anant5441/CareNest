import { useState, useEffect } from 'react';
import { View, StyleSheet, Button, Alert } from 'react-native';
import {
    useAudioRecorder,
    AudioModule,
    RecordingPresets,
    setAudioModeAsync,
    useAudioRecorderState,
} from 'expo-audio';
import serverConfig from "../../Constants/serverConfig";

export default function App() {
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const recorderState = useAudioRecorderState(audioRecorder);
    const [isUploading, setIsUploading] = useState(false);

    const record = async () => {
        try {
            await audioRecorder.prepareToRecordAsync();
            audioRecorder.record();
        } catch (error) {
            console.error('Error starting recording:', error);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            await audioRecorder.stop();
            const recordingUri = audioRecorder.uri;
            if (recordingUri) {
                await uploadRecording(recordingUri);
            } else {
                Alert.alert('Error', 'No recording found');
            }
        } catch (error) {
            console.error('Error stopping recording:', error);
            Alert.alert('Error', 'Failed to stop recording');
        }
    };

    const uploadRecording = async (uri) => {
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', {
                uri: uri,
                type: 'audio/m4a',
                name: 'recording.m4a',
            });

            let url = serverConfig.BaseURL + '/api/voice/speech-to-text';
            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const responseData = await response.json();
            console.log('API Response:', responseData);

            if (response.ok) {
                Alert.alert('Success', 'Recording uploaded successfully');
            } else {
                Alert.alert('Error', `Server error: ${response.status}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Error', 'Failed to upload recording');
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        (async () => {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            if (!status.granted) {
                Alert.alert('Permission to access microphone was denied');
            }

            setAudioModeAsync({
                playsInSilentMode: true,
                allowsRecording: true,
            });
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Button
                title={
                    isUploading
                        ? 'Uploading...'
                        : recorderState.isRecording
                            ? 'Stop Recording'
                            : 'Start Recording'
                }
                onPress={recorderState.isRecording ? stopRecording : record}
                disabled={isUploading}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#ecf0f1',
        padding: 10,
    },
});