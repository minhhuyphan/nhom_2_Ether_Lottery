import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.Random;

public class BlockchainLuckySpin extends JFrame {
    // Components
    private JLabel balanceLabel;
    private JLabel jackpotLabel;
    private JLabel slot1, slot2, slot3;
    private JButton spinButton;
    
    // Game variables
    private double balance = 0;
    private double jackpot = 0;
    private Random random = new Random();
    private Timer spinTimer;
    private int spinDuration = 2000; // 2 seconds
    private long spinStartTime;
    private boolean isSpinning = false;
    
    // Colors
    private final Color DARK_BG = new Color(20, 20, 30);
    private final Color GOLD = new Color(255, 215, 0);
    private final Color SLOT_BG = new Color(40, 40, 50);
    
    public BlockchainLuckySpin() {
        initializeUI();
    }
    
    private void initializeUI() {
        setTitle("Blockchain Lucky Spin");
        setSize(600, 500);
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setLocationRelativeTo(null);
        setResizable(false);
        
        // Main panel with dark background
        JPanel mainPanel = new JPanel();
        mainPanel.setLayout(new BorderLayout(10, 20));
        mainPanel.setBackground(DARK_BG);
        mainPanel.setBorder(BorderFactory.createEmptyBorder(30, 40, 30, 40));
        
        // Top panel - Balance and Jackpot
        JPanel topPanel = createTopPanel();
        
        // Center panel - Slot display
        JPanel centerPanel = createCenterPanel();
        
        // Bottom panel - Spin button
        JPanel bottomPanel = createBottomPanel();
        
        mainPanel.add(topPanel, BorderLayout.NORTH);
        mainPanel.add(centerPanel, BorderLayout.CENTER);
        mainPanel.add(bottomPanel, BorderLayout.SOUTH);
        
        add(mainPanel);
        setVisible(true);
    }
    
    private JPanel createTopPanel() {
        JPanel topPanel = new JPanel();
        topPanel.setLayout(new GridLayout(2, 1, 10, 10));
        topPanel.setBackground(DARK_BG);
        
        balanceLabel = new JLabel("Số dư ví: " + balance + " ETH", SwingConstants.CENTER);
        balanceLabel.setFont(new Font("Arial", Font.BOLD, 20));
        balanceLabel.setForeground(GOLD);
        
        jackpotLabel = new JLabel("Jackpot: " + jackpot + " ETH", SwingConstants.CENTER);
        jackpotLabel.setFont(new Font("Arial", Font.BOLD, 20));
        jackpotLabel.setForeground(GOLD);
        
        topPanel.add(balanceLabel);
        topPanel.add(jackpotLabel);
        
        return topPanel;
    }
    
    private JPanel createCenterPanel() {
        JPanel centerPanel = new JPanel();
        centerPanel.setLayout(new FlowLayout(FlowLayout.CENTER, 20, 50));
        centerPanel.setBackground(DARK_BG);
        
        // Create 3 slot labels
        slot1 = createSlotLabel("7");
        slot2 = createSlotLabel("7");
        slot3 = createSlotLabel("7");
        
        centerPanel.add(slot1);
        centerPanel.add(slot2);
        centerPanel.add(slot3);
        
        return centerPanel;
    }
    
    private JLabel createSlotLabel(String text) {
        JLabel label = new JLabel(text, SwingConstants.CENTER);
        label.setFont(new Font("Arial", Font.BOLD, 80));
        label.setForeground(GOLD);
        label.setBackground(SLOT_BG);
        label.setOpaque(true);
        label.setPreferredSize(new Dimension(120, 120));
        label.setBorder(BorderFactory.createLineBorder(GOLD, 3));
        return label;
    }
    
    private JPanel createBottomPanel() {
        JPanel bottomPanel = new JPanel();
        bottomPanel.setLayout(new FlowLayout(FlowLayout.CENTER));
        bottomPanel.setBackground(DARK_BG);
        
        spinButton = new JButton("QUAY NGAY");
        spinButton.setFont(new Font("Arial", Font.BOLD, 24));
        spinButton.setPreferredSize(new Dimension(250, 60));
        spinButton.setBackground(GOLD);
        spinButton.setForeground(DARK_BG);
        spinButton.setFocusPainted(false);
        spinButton.setBorder(BorderFactory.createLineBorder(GOLD, 2));
        spinButton.setCursor(new Cursor(Cursor.HAND_CURSOR));
        
        // Hover effect
        spinButton.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                if (!isSpinning) {
                    spinButton.setBackground(new Color(255, 230, 100));
                }
            }
            
            @Override
            public void mouseExited(MouseEvent e) {
                if (!isSpinning) {
                    spinButton.setBackground(GOLD);
                }
            }
        });
        
        // Spin action
        spinButton.addActionListener(e -> startSpin());
        
        bottomPanel.add(spinButton);
        
        return bottomPanel;
    }
    
    private void startSpin() {
        if (isSpinning) return;
        
        isSpinning = true;
        spinButton.setEnabled(false);
        spinButton.setText("ĐANG QUAY...");
        spinStartTime = System.currentTimeMillis();
        
        // Timer to update slot numbers during spin
        spinTimer = new Timer(100, new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                // Update all slots with random numbers
                slot1.setText(String.valueOf(random.nextInt(10)));
                slot2.setText(String.valueOf(random.nextInt(10)));
                slot3.setText(String.valueOf(random.nextInt(10)));
                
                // Check if spin duration has passed
                long elapsed = System.currentTimeMillis() - spinStartTime;
                if (elapsed >= spinDuration) {
                    stopSpin();
                }
            }
        });
        
        spinTimer.start();
    }
    
    private void stopSpin() {
        spinTimer.stop();
        
        // Generate final random numbers
        int num1 = random.nextInt(10);
        int num2 = random.nextInt(10);
        int num3 = random.nextInt(10);
        
        slot1.setText(String.valueOf(num1));
        slot2.setText(String.valueOf(num2));
        slot3.setText(String.valueOf(num3));
        
        // Check for jackpot
        checkWin(num1, num2, num3);
        
        // Reset button
        isSpinning = false;
        spinButton.setEnabled(true);
        spinButton.setText("QUAY NGAY");
    }
    
    private void checkWin(int num1, int num2, int num3) {
        if (num1 == num2 && num2 == num3) {
            // Jackpot!
            Timer delayTimer = new Timer(300, new ActionListener() {
                @Override
                public void actionPerformed(ActionEvent e) {
                    showJackpotDialog();
                    ((Timer)e.getSource()).stop();
                }
            });
            delayTimer.setRepeats(false);
            delayTimer.start();
        }
    }
    
    private void showJackpotDialog() {
        // Create custom dialog
        JDialog dialog = new JDialog(this, "CHÚC MỪNG!", true);
        dialog.setSize(400, 200);
        dialog.setLocationRelativeTo(this);
        dialog.getContentPane().setBackground(DARK_BG);
        dialog.setLayout(new BorderLayout(10, 10));
        
        JLabel messageLabel = new JLabel("🎉 NỔ HŨ! 🎉", SwingConstants.CENTER);
        messageLabel.setFont(new Font("Arial", Font.BOLD, 36));
        messageLabel.setForeground(GOLD);
        
        JButton okButton = new JButton("TUYỆT VỜI!");
        okButton.setFont(new Font("Arial", Font.BOLD, 18));
        okButton.setBackground(GOLD);
        okButton.setForeground(DARK_BG);
        okButton.setPreferredSize(new Dimension(150, 50));
        okButton.setFocusPainted(false);
        okButton.addActionListener(e -> dialog.dispose());
        
        JPanel buttonPanel = new JPanel();
        buttonPanel.setBackground(DARK_BG);
        buttonPanel.add(okButton);
        
        dialog.add(messageLabel, BorderLayout.CENTER);
        dialog.add(buttonPanel, BorderLayout.SOUTH);
        dialog.setVisible(true);
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            try {
                // Set system look and feel
                UIManager.setLookAndFeel(UIManager.getSystemLookAndFeelClassName());
            } catch (Exception e) {
                e.printStackTrace();
            }
            new BlockchainLuckySpin();
        });
    }
}
