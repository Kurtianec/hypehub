package com.hypehub.admin;

import android.graphics.Color;
import android.os.Bundle;
import android.view.WindowManager;
import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import java.util.concurrent.Executor;

public class MainActivity extends BridgeActivity {
  private static final long RELOCK_AFTER_MS = 60_000L;
  private long backgroundedAt = 0L;
  private boolean unlocked = false;
  private boolean promptVisible = false;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
    applySystemBars();
  }

  @Override
  public void onResume() {
    super.onResume();
    applySystemBars();
    boolean expired = backgroundedAt > 0 && System.currentTimeMillis() - backgroundedAt >= RELOCK_AFTER_MS;
    if (!unlocked || expired) authenticate();
  }

  private void applySystemBars() {
    getWindow().setStatusBarColor(Color.rgb(10, 10, 10));
    getWindow().setNavigationBarColor(Color.rgb(10, 10, 10));
    WindowInsetsControllerCompat controller =
      WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    controller.setAppearanceLightStatusBars(false);
    controller.setAppearanceLightNavigationBars(false);
  }

  @Override
  public void onPause() {
    super.onPause();
    backgroundedAt = System.currentTimeMillis();
  }

  private void authenticate() {
    if (promptVisible || isFinishing()) return;
    int allowed = BiometricManager.Authenticators.BIOMETRIC_STRONG | BiometricManager.Authenticators.DEVICE_CREDENTIAL;
    BiometricManager manager = BiometricManager.from(this);
    if (manager.canAuthenticate(allowed) != BiometricManager.BIOMETRIC_SUCCESS) {
      unlocked = true;
      return;
    }
    promptVisible = true;
    Executor executor = ContextCompat.getMainExecutor(this);
    BiometricPrompt prompt = new BiometricPrompt(this, executor, new BiometricPrompt.AuthenticationCallback() {
      @Override
      public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
        super.onAuthenticationSucceeded(result);
        promptVisible = false;
        unlocked = true;
        backgroundedAt = 0L;
      }

      @Override
      public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
        super.onAuthenticationError(errorCode, errString);
        promptVisible = false;
        unlocked = false;
        if (!isChangingConfigurations()) finishAndRemoveTask();
      }
    });
    BiometricPrompt.PromptInfo info = new BiometricPrompt.PromptInfo.Builder()
      .setTitle("HypeHub Admin")
      .setSubtitle("Подтвердите личность для доступа к админке")
      .setAllowedAuthenticators(allowed)
      .build();
    prompt.authenticate(info);
  }
}
