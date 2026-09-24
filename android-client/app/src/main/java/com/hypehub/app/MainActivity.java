package com.hypehub.app;

import android.graphics.Color;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    applySystemBars();
  }

  @Override
  public void onResume() {
    super.onResume();
    applySystemBars();
  }

  private void applySystemBars() {
    getWindow().setStatusBarColor(Color.rgb(10, 10, 10));
    getWindow().setNavigationBarColor(Color.rgb(10, 10, 10));
    WindowInsetsControllerCompat controller =
      WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
    controller.setAppearanceLightStatusBars(false);
    controller.setAppearanceLightNavigationBars(false);
  }
}
