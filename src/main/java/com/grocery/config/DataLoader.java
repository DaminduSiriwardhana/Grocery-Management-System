package com.grocery.config;

import com.grocery.model.*;
import com.grocery.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private PromotionRepository promotionRepository;
    
    @Autowired
    private StockManagementRepository stockManagementRepository;
    
    @Autowired
    private MaintenanceReportRepository maintenanceReportRepository;
    
    @Autowired
    private DeliveryTrackingRepository deliveryTrackingRepository;
    
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        System.out.println("DataLoader: Checking if data needs to be loaded...");
        long userCount = userRepository.count();
        System.out.println("DataLoader: Current user count: " + userCount);
        
        // Only load data if database is empty
        if (userCount == 0) {
            System.out.println("DataLoader: Database is empty, loading sample data...");
            loadUsers();
            loadProducts();
            loadPromotions();
            loadStockManagement();
            loadOrders();
            loadMaintenanceReports();
            loadDeliveryTracking();
            System.out.println("DataLoader: Sample data loading completed!");
        } else {
            System.out.println("DataLoader: Database already has data, skipping sample data loading.");
        }
    }

    private void loadUsers() {
        List<User> users = Arrays.asList(
            // Admin User
            createUser("admin", "admin@grocery.com", "admin123", "Admin User", "1234567890", 
                     "123 Admin St", "Admin City", "12345", User.UserRole.ADMIN),
            
            // Store Manager
            createUser("manager", "manager@grocery.com", "manager123", "Store Manager", "1234567891", 
                     "456 Manager Ave", "Manager City", "12346", User.UserRole.STORE_MANAGER),
            
            // Delivery Person
            createUser("delivery", "delivery@grocery.com", "delivery123", "Delivery Person", "1234567892", 
                     "789 Delivery St", "Delivery City", "12347", User.UserRole.DELIVERY_PERSON),
            
            // Regular Customers
            createUser("john_doe", "john@email.com", "customer123", "John Doe", "1234567893", 
                     "100 Customer St", "Customer City", "12348", User.UserRole.CUSTOMER),
            
            createUser("jane_smith", "jane@email.com", "customer123", "Jane Smith", "1234567894", 
                     "200 Customer Ave", "Customer City", "12349", User.UserRole.CUSTOMER),
            
            createUser("bob_wilson", "bob@email.com", "customer123", "Bob Wilson", "1234567895", 
                     "300 Customer Blvd", "Customer City", "12350", User.UserRole.CUSTOMER)
        );
        
        userRepository.saveAll(users);
        System.out.println("✅ Loaded " + users.size() + " users");
    }

    private User createUser(String username, String email, String password, String fullName, 
                           String phone, String address, String city, String postalCode, User.UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setAddress(address);
        user.setCity(city);
        user.setPostalCode(postalCode);
        user.setRole(role);
        return user;
    }

    private void loadProducts() {
        List<Product> products = Arrays.asList(
            createProduct("Fresh Apples", "Fruits", new BigDecimal("2.99"), 50, "Fresh red apples from local farms", "apple.jpg"),
            createProduct("Bananas", "Fruits", new BigDecimal("1.49"), 75, "Fresh yellow bananas", "banana.jpg"),
            createProduct("Oranges", "Fruits", new BigDecimal("3.49"), 40, "Sweet and juicy oranges", "orange.jpg"),
            createProduct("Carrots", "Vegetables", new BigDecimal("1.99"), 60, "Fresh organic carrots", "carrot.jpg"),
            createProduct("Broccoli", "Vegetables", new BigDecimal("2.49"), 35, "Fresh green broccoli", "broccoli.jpg"),
            createProduct("Tomatoes", "Vegetables", new BigDecimal("2.99"), 45, "Fresh vine tomatoes", "tomato.jpg"),
            createProduct("Whole Milk", "Dairy", new BigDecimal("3.99"), 30, "Fresh whole milk 1 gallon", "milk.jpg"),
            createProduct("Cheddar Cheese", "Dairy", new BigDecimal("4.99"), 25, "Sharp cheddar cheese", "cheese.jpg"),
            createProduct("Yogurt", "Dairy", new BigDecimal("2.99"), 40, "Greek yogurt", "yogurt.jpg"),
            createProduct("White Bread", "Bakery", new BigDecimal("2.49"), 20, "Fresh white bread", "bread.jpg"),
            createProduct("Croissants", "Bakery", new BigDecimal("3.99"), 15, "Buttery croissants", "croissant.jpg"),
            createProduct("Bagels", "Bakery", new BigDecimal("2.99"), 18, "Fresh bagels", "bagel.jpg"),
            createProduct("Coca Cola", "Beverages", new BigDecimal("1.99"), 50, "Classic Coca Cola", "coke.jpg"),
            createProduct("Orange Juice", "Beverages", new BigDecimal("3.49"), 25, "Fresh orange juice", "oj.jpg"),
            createProduct("Coffee", "Beverages", new BigDecimal("8.99"), 20, "Premium coffee beans", "coffee.jpg")
        );
        
        productRepository.saveAll(products);
        System.out.println("✅ Loaded " + products.size() + " products");
    }

    private Product createProduct(String name, String category, BigDecimal price, Integer stock, 
                                 String description, String imageUrl) {
        Product product = new Product();
        product.setProductName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setStockQuantity(stock);
        product.setDescription(description);
        product.setImageUrl(imageUrl);
        return product;
    }

    private void loadPromotions() {
        List<Promotion> promotions = Arrays.asList(
            createPromotion("Summer Sale", "20% off on all fruits", 20.0, null, 
                         LocalDate.now().minusDays(5), LocalDate.now().plusDays(25)),
            createPromotion("Dairy Discount", "15% off on dairy products", 15.0, null, 
                         LocalDate.now().minusDays(2), LocalDate.now().plusDays(18)),
            createPromotion("Bakery Special", "Buy 2 get 1 free on bakery items", null, 0.0, 
                         LocalDate.now(), LocalDate.now().plusDays(10))
        );
        
        promotionRepository.saveAll(promotions);
        System.out.println("✅ Loaded " + promotions.size() + " promotions");
    }

    private Promotion createPromotion(String name, String description, Double discountPercentage, 
                                    Double discountAmount, LocalDate startDate, LocalDate endDate) {
        Promotion promotion = new Promotion();
        promotion.setPromotionName(name);
        promotion.setDescription(description);
        promotion.setDiscountPercentage(discountPercentage != null ? new BigDecimal(discountPercentage.toString()) : null);
        promotion.setDiscountAmount(discountAmount != null ? new BigDecimal(discountAmount.toString()) : null);
        promotion.setStartDate(startDate);
        promotion.setEndDate(endDate);
        promotion.setIsActive(true);
        return promotion;
    }

    private void loadStockManagement() {
        List<Product> products = productRepository.findAll();
        String[] warehouses = {"Main Warehouse", "North Warehouse", "South Warehouse", "East Warehouse", "West Warehouse"};
        
        List<StockManagement> stocks = new ArrayList<>();
        
        for (int i = 0; i < products.size(); i++) {
            Product product = products.get(i);
            
            // Create multiple stock entries for some products
            int stockEntries = (i % 3 == 0) ? 2 : 1; // Some products in multiple warehouses
            
            for (int j = 0; j < stockEntries; j++) {
                StockManagement stock = new StockManagement();
                stock.setProduct(product);
                stock.setWarehouseLocation(warehouses[j % warehouses.length]);
                
                // Vary the quantities
                int baseQuantity = product.getStockQuantity();
                int adjustedQuantity = baseQuantity + (j * 20) - (i * 5);
                stock.setQuantityAvailable(Math.max(adjustedQuantity, 0));
                
                // Set different reorder levels based on product type
                int reorderLevel = product.getCategory().equals("Fruits") ? 15 : 
                                 product.getCategory().equals("Vegetables") ? 20 : 10;
                stock.setReorderLevel(reorderLevel);
                
                // Vary the last restocked dates
                int daysAgo = (i + j) % 10 + 1;
                stock.setLastRestocked(LocalDateTime.now().minusDays(daysAgo));
                
                stocks.add(stock);
            }
        }
        
        stockManagementRepository.saveAll(stocks);
        System.out.println("✅ Loaded " + stocks.size() + " stock records");
    }

    private void loadOrders() {
        User john = userRepository.findByUsername("john_doe").orElse(null);
        User jane = userRepository.findByUsername("jane_smith").orElse(null);
        User bob = userRepository.findByUsername("bob_wilson").orElse(null);
        
        if (john != null && jane != null && bob != null) {
            List<Product> products = productRepository.findAll();
            
            // John's orders
            Order johnOrder1 = createOrder(john, new BigDecimal("15.97"), Order.OrderStatus.DELIVERED, 
                                          "100 Customer St, Customer City", LocalDate.now().minusDays(3));
            Order johnOrder2 = createOrder(john, new BigDecimal("8.47"), Order.OrderStatus.SHIPPED, 
                                          "100 Customer St, Customer City", LocalDate.now().minusDays(1));
            
            // Jane's orders
            Order janeOrder1 = createOrder(jane, new BigDecimal("12.98"), Order.OrderStatus.CONFIRMED, 
                                          "200 Customer Ave, Customer City", LocalDate.now());
            
            // Bob's orders
            Order bobOrder1 = createOrder(bob, new BigDecimal("25.95"), Order.OrderStatus.PENDING, 
                                         "300 Customer Blvd, Customer City", LocalDate.now().plusDays(1));
            
            List<Order> orders = Arrays.asList(johnOrder1, johnOrder2, janeOrder1, bobOrder1);
            orderRepository.saveAll(orders);
            
            // Add order items
            addOrderItems(johnOrder1, products.subList(0, 3), Arrays.asList(2, 1, 3));
            addOrderItems(johnOrder2, products.subList(3, 5), Arrays.asList(1, 2));
            addOrderItems(janeOrder1, products.subList(6, 8), Arrays.asList(1, 1));
            addOrderItems(bobOrder1, products.subList(9, 12), Arrays.asList(2, 1, 3));
            
            System.out.println("✅ Loaded " + orders.size() + " orders with items");
        }
    }

    private Order createOrder(User user, BigDecimal totalAmount, Order.OrderStatus status, 
                            String deliveryAddress, LocalDate deliveryDate) {
        Order order = new Order();
        order.setUser(user);
        order.setTotalAmount(totalAmount);
        order.setStatus(status);
        order.setDeliveryAddress(deliveryAddress);
        order.setDeliveryDate(deliveryDate);
        return order;
    }

    private void addOrderItems(Order order, List<Product> products, List<Integer> quantities) {
        for (int i = 0; i < products.size(); i++) {
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(products.get(i));
            item.setQuantity(quantities.get(i));
            item.setUnitPrice(products.get(i).getPrice());
            item.setSubtotal(products.get(i).getPrice().multiply(new BigDecimal(quantities.get(i))));
            orderItemRepository.save(item);
        }
    }

    private void loadMaintenanceReports() {
        User admin = userRepository.findByUsername("admin").orElse(null);
        User manager = userRepository.findByUsername("manager").orElse(null);
        User delivery = userRepository.findByUsername("delivery").orElse(null);
        
        if (admin != null && manager != null && delivery != null) {
            List<MaintenanceReport> reports = Arrays.asList(
                createReport(admin, "System Performance", "Database queries are running slowly", 
                           MaintenanceReport.ReportStatus.OPEN, MaintenanceReport.Priority.HIGH),
                createReport(manager, "Inventory Issue", "Stock levels are not updating correctly", 
                           MaintenanceReport.ReportStatus.IN_PROGRESS, MaintenanceReport.Priority.MEDIUM),
                createReport(admin, "Security Update", "Need to update security patches", 
                           MaintenanceReport.ReportStatus.RESOLVED, MaintenanceReport.Priority.CRITICAL),
                createReport(delivery, "Delivery App Issue", "GPS tracking not working properly", 
                           MaintenanceReport.ReportStatus.OPEN, MaintenanceReport.Priority.MEDIUM),
                createReport(manager, "Payment Gateway", "Credit card processing is intermittent", 
                           MaintenanceReport.ReportStatus.IN_PROGRESS, MaintenanceReport.Priority.HIGH),
                createReport(admin, "Server Maintenance", "Scheduled server maintenance completed", 
                           MaintenanceReport.ReportStatus.CLOSED, MaintenanceReport.Priority.LOW),
                createReport(manager, "User Interface", "Mobile app crashes on Android devices", 
                           MaintenanceReport.ReportStatus.OPEN, MaintenanceReport.Priority.HIGH),
                createReport(delivery, "Route Optimization", "Delivery routes need optimization", 
                           MaintenanceReport.ReportStatus.IN_PROGRESS, MaintenanceReport.Priority.MEDIUM)
            );
            
            maintenanceReportRepository.saveAll(reports);
            System.out.println("✅ Loaded " + reports.size() + " maintenance reports");
        }
    }

    private MaintenanceReport createReport(User reportedBy, String reportType, String description, 
                                         MaintenanceReport.ReportStatus status, MaintenanceReport.Priority priority) {
        MaintenanceReport report = new MaintenanceReport();
        report.setReportedBy(reportedBy);
        report.setReportType(reportType);
        report.setDescription(description);
        report.setStatus(status);
        report.setPriority(priority);
        return report;
    }

    private void loadDeliveryTracking() {
        List<Order> orders = orderRepository.findAll();
        User deliveryPerson = userRepository.findByUsername("delivery").orElse(null);
        
        if (deliveryPerson != null && !orders.isEmpty()) {
            List<DeliveryTracking> tracking = Arrays.asList(
                createTracking(orders.get(0), deliveryPerson, DeliveryTracking.DeliveryStatus.DELIVERED, 
                              "Customer Address", LocalDateTime.now().minusDays(1)),
                createTracking(orders.get(1), deliveryPerson, DeliveryTracking.DeliveryStatus.IN_TRANSIT, 
                              "On route to customer", LocalDateTime.now().plusHours(2)),
                createTracking(orders.get(2), deliveryPerson, DeliveryTracking.DeliveryStatus.PENDING, 
                              "Warehouse", LocalDateTime.now().plusDays(1))
            );
            
            deliveryTrackingRepository.saveAll(tracking);
            System.out.println("✅ Loaded " + tracking.size() + " delivery tracking records");
        }
    }

    private DeliveryTracking createTracking(Order order, User deliveryPerson, 
                                          DeliveryTracking.DeliveryStatus status, String location, 
                                          LocalDateTime estimatedTime) {
        DeliveryTracking tracking = new DeliveryTracking();
        tracking.setOrder(order);
        tracking.setDeliveryPerson(deliveryPerson);
        tracking.setCurrentStatus(status);
        tracking.setCurrentLocation(location);
        tracking.setEstimatedDeliveryTime(estimatedTime);
        return tracking;
    }
}
