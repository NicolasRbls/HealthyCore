import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Keyboard,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Colors from "../../../constants/Colors";
import Layout from "../../../constants/Layout";
import { TextStyles } from "../../../constants/Fonts";
import Header from "../../../components/layout/Header";
import imageMapping from "../../../constants/imageMapping";
import { CameraView, Camera } from "expo-camera";
import { openFoodFactsService } from "../../../services/nutrition.service";

// Type definitions
interface Tag {
  id: number;
  name: string;
}

interface FoodProduct {
  id: number;
  name: string;
  image: string | null;
  type: string;
  source: string;
  calories: number;
  proteins: number;
  carbs: number;
  fats: number;
  tags: Tag[];
  barcode?: string;
}

// Response type for API calls
interface ApiResponse {
  status?: string;
  data?: FoodProduct;
}

export default function SearchProductsScreen() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [scanned, setScanned] = useState<boolean>(false);
  const [cameraKey, setCameraKey] = useState<number>(0);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const previousSearchLength = useRef<number>(0);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === "granted");
    };

    getCameraPermissions();
  }, []);

  // Reset search when exiting screen
  useEffect(() => {
    return () => {
      // Clean up when component unmounts
      resetSearch();
    };
  }, []);

  // Handle changes to search query, detect when user is deleting text
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);

    // Si la longueur du texte a diminué (suppression) et que des résultats sont affichés
    if (
      text.length < previousSearchLength.current &&
      (products.length > 0 || hasSearched)
    ) {
      // Réinitialiser les résultats
      setProducts([]);
      setHasSearched(false);
    }

    previousSearchLength.current = text.length;
  };

  // Reset search functionality
  const resetSearch = () => {
    setSearchQuery("");
    setProducts([]);
    setHasSearched(false);
    previousSearchLength.current = 0;
  };

  // Pull to refresh functionality
  const onRefresh = () => {
    setRefreshing(true);
    resetSearch();
    setRefreshing(false);
  };

  // Handle barcode scan
  const handleBarCodeScanned = async ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    // Set scanned to true to avoid multiple scans
    setScanned(true);

    // Vérifier que le code-barres est valide (format EAN/UPC)
    const validBarcodeRegex = /^[0-9]{8,14}$/;
    if (!validBarcodeRegex.test(data)) {
      setTimeout(() => {
        Alert.alert(
          "Code-barres invalide",
          "Le code détecté n'est pas un code-barres de produit valide. Veuillez réessayer.",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset scanning state
                setScanned(false);
                // Reinitialize camera
                resetCamera();
              },
            },
          ]
        );
      }, 300);
      return;
    }

    // Close the scanner modal
    setShowQRScanner(false);

    try {
      // Show loading indicator
      setIsLoading(true);

      // Call the service to get product details by barcode
      const response = (await openFoodFactsService.getProductByBarcode(
        data
      )) as ApiResponse;

      // Check if the request was successful but no product was found
      if (!response || response.status === "fail") {
        setTimeout(() => {
          Alert.alert(
            "Produit non trouvé",
            "Ce produit n'a pas été trouvé dans notre base de données.",
            [
              {
                text: "OK",
                onPress: () => {
                  // Reset scanning state
                  setScanned(false);
                  // Reinitialize camera
                  resetCamera();
                },
              },
            ]
          );
        }, 300);
        return;
      }

      // Si on a un produit, naviguer vers la page de détail
      if (response.data && response.data.id) {
        // Navigate to the product detail page
        router.push(`/user/nutrition/products/${response.data.id}` as any);
      } else {
        // Dans le cas où la structure de réponse est inattendue
        setTimeout(() => {
          Alert.alert(
            "Erreur",
            "Le format des données reçues est incorrect. Veuillez réessayer.",
            [
              {
                text: "OK",
                onPress: () => {
                  setScanned(false);
                  resetCamera();
                },
              },
            ]
          );
        }, 300);
      }
    } catch (error) {
      console.error("Error scanning barcode:", error);

      // Distinguer les différents types d'erreurs
      let errorMessage =
        "Une erreur s'est produite lors de la recherche du produit.";

      // Si c'est une erreur de réseau
      if (
        error instanceof Error &&
        error.message &&
        error.message.includes("Network Error")
      ) {
        errorMessage =
          "Problème de connexion. Vérifiez votre connexion internet et réessayez.";
      }
      // Si c'est une erreur 404 spécifique
      else if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "status" in error.response &&
        error.response.status === 404
      ) {
        errorMessage = "Ce produit n'existe pas dans notre base de données.";
      }

      setTimeout(() => {
        Alert.alert("Erreur", errorMessage, [
          {
            text: "OK",
            onPress: () => {
              // Reset scanning state
              setScanned(false);
              // Reinitialize camera
              resetCamera();
            },
          },
        ]);
      }, 300);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset camera to be able to scan again
  const resetCamera = () => {
    setScanned(false);
    setCameraKey((prevKey) => prevKey + 1); // Force re-render of camera component
  };

  // Handle search
  const handleSearch = async () => {
    // Suppression de la condition des 4 caractères minimum
    if (searchQuery.trim().length === 0) {
      Alert.alert("Recherche vide", "Veuillez entrer un terme de recherche.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    Keyboard.dismiss();

    try {
      // Call the service to search for products
      const response = await openFoodFactsService.searchProducts(
        searchQuery,
        20
      );

      if (Array.isArray(response)) {
        // Filtrer les produits pour éliminer les doublons par ID
        const uniqueProducts: { [key: number]: FoodProduct } = {};
        response.forEach((item) => {
          // S'assurer que l'image n'est jamais null
          const product = {
            ...item,
            image: item.image || "",
          };
          uniqueProducts[item.id] = product;
        });

        // Convertir l'objet en tableau
        setProducts(Object.values(uniqueProducts));
      } else {
        setProducts([]);
        console.error("Invalid response format:", response);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      Alert.alert(
        "Erreur de recherche",
        "Une erreur s'est produite lors de la recherche. Veuillez réessayer."
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Get food image based on source and id
  const getFoodImage = (food: FoodProduct) => {
    // Check if the image is null or undefined
    if (!food.image) {
      // Return a placeholder if no image
      return {
        uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${encodeURIComponent(
          food.name
        )}`,
      };
    }

    // Check if the image path is an HTTP or HTTPS URL
    if (food.image.startsWith("http://") || food.image.startsWith("https://")) {
      return { uri: food.image };
    }

    // Map aliment IDs to the imageMapping for local images
    const mappedId = 200 + food.id;

    return (
      imageMapping[mappedId] || {
        uri: `https://placehold.co/400x300/92A3FD/FFFFFF?text=${encodeURIComponent(
          food.name
        )}`,
      }
    );
  };

  // Navigate to food detail
  const navigateToProductDetail = (productId: number) => {
    router.push(`/user/nutrition/products/${productId}` as any);
  };

  // Product list item component
  const ProductItem = ({ product }: { product: FoodProduct }) => {
    // Product name parts (usually in format "Name - Brand - Weight")
    const nameParts = product.name.split(" - ");
    const productName = nameParts[0];
    const productBrand = nameParts.length > 1 ? nameParts[1] : "";

    return (
      <TouchableOpacity
        style={styles.productItem}
        onPress={() => navigateToProductDetail(product.id)}
        activeOpacity={0.8}
      >
        <Image
          source={getFoodImage(product)}
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {productName}
          </Text>
          {productBrand && (
            <Text style={styles.productBrand} numberOfLines={1}>
              {productBrand}
            </Text>
          )}
          <View style={styles.productMacros}>
            <Text style={styles.caloriesText}>{product.calories} cal</Text>
            <View style={styles.macrosRow}>
              <Text style={styles.macroText}>P: {product.proteins}g</Text>
              <Text style={styles.macroText}>G: {product.carbs}g</Text>
              <Text style={styles.macroText}>L: {product.fats}g</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // QR Scanner Modal
  const QRScannerModal = () => (
    <Modal
      visible={showQRScanner}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setShowQRScanner(false);
        resetCamera();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Scanner un code-barres</Text>
            <TouchableOpacity
              onPress={() => {
                setShowQRScanner(false);
                resetCamera();
              }}
            >
              <Ionicons name="close" size={24} color={Colors.gray.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.scannerArea}>
            {hasCameraPermission === null ? (
              <View style={styles.scannerPlaceholder}>
                <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
                <Text style={styles.scannerText}>
                  Demande d'accès à la caméra...
                </Text>
              </View>
            ) : hasCameraPermission === false ? (
              <View style={styles.scannerPlaceholder}>
                <Ionicons
                  name="camera-off"
                  size={120}
                  color={Colors.gray.light}
                />
                <Text style={styles.scannerText}>Accès à la caméra refusé</Text>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { marginTop: Layout.spacing.md },
                  ]}
                  onPress={async () => {
                    const { status } =
                      await Camera.requestCameraPermissionsAsync();
                    setHasCameraPermission(status === "granted");
                  }}
                >
                  <Text style={styles.cancelButtonText}>
                    Demander à nouveau
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <CameraView
                key={`camera-${cameraKey}`} // Force re-render when key changes
                style={styles.camera}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["ean13", "ean8", "upc_e", "upc_a"],
                }}
              >
                <View style={styles.scannerOverlay}>
                  <View style={styles.scannerTargetBorder}>
                    <Ionicons
                      name="scan-outline"
                      size={120}
                      color={Colors.white}
                      style={{ opacity: 0.7 }}
                    />
                  </View>
                  <Text
                    style={[
                      styles.scannerText,
                      { color: Colors.white, marginTop: Layout.spacing.xl },
                    ]}
                  >
                    Cadrez le code-barres dans la zone de scan
                  </Text>
                </View>
              </CameraView>
            )}
          </View>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setShowQRScanner(false);
              resetCamera();
            }}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Empty state component
  const EmptyState = ({ message }: { message: string }) => (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="search-outline" size={60} color={Colors.gray.light} />
      <Text style={styles.emptyStateText}>{message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title="Recherche de produits"
        showBackButton
        onBackPress={() => router.back()}
        style={{ marginTop: Layout.spacing.md }}
      />

      {/* Search Bar and QR Scanner Button */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.gray.medium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un produit..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholderTextColor={Colors.gray.medium}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={resetSearch}>
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.gray.medium}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={styles.qrButton}
          onPress={() => {
            setShowQRScanner(true);
            resetCamera();
          }}
        >
          <Ionicons name="barcode-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brandBlue[0]} />
          <Text style={styles.loadingText}>Recherche en cours...</Text>
        </View>
      ) : !hasSearched ? (
        <FlatList
          contentContainerStyle={styles.emptyStateContainer}
          data={[]}
          keyExtractor={() => "empty"}
          renderItem={null}
          ListEmptyComponent={
            <EmptyState message="Entrez votre recherche et appuyez sur Entrée pour rechercher un produit, ou scannez un code-barres." />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.brandBlue[0]]}
              tintColor={Colors.brandBlue[0]}
            />
          }
        />
      ) : products.length === 0 ? (
        <FlatList
          contentContainerStyle={styles.emptyStateContainer}
          data={[]}
          keyExtractor={() => "no-results"}
          renderItem={null}
          ListEmptyComponent={
            <EmptyState message="Aucun produit trouvé. Essayez avec d'autres termes ou scannez un code-barres." />
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.brandBlue[0]]}
              tintColor={Colors.brandBlue[0]}
            />
          }
        />
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductItem product={item} />}
          keyExtractor={(item) =>
            `product-${item.id}-${item.name.substring(0, 10)}`
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.brandBlue[0]]}
              tintColor={Colors.brandBlue[0]}
            />
          }
        />
      )}

      {/* QR Code Scanner Modal */}
      <QRScannerModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.pill,
    paddingHorizontal: Layout.spacing.md,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: Layout.spacing.sm,
    ...TextStyles.body,
    color: Colors.black,
  },
  qrButton: {
    marginLeft: Layout.spacing.md,
    backgroundColor: Colors.brandBlue[0],
    borderRadius: Layout.borderRadius.pill,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    ...Layout.elevation.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    marginTop: Layout.spacing.md,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Layout.spacing.xl,
  },
  emptyStateText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    marginTop: Layout.spacing.md,
  },
  listContainer: {
    padding: Layout.spacing.lg,
    paddingBottom: 100, // Extra padding for better scrolling
  },
  productItem: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.gray.ultraLight,
    overflow: "hidden",
    ...Layout.elevation.sm,
  },
  productImage: {
    width: 100,
    height: 100,
    backgroundColor: Colors.gray.ultraLight,
  },
  productInfo: {
    flex: 1,
    padding: Layout.spacing.md,
    justifyContent: "space-between",
  },
  productName: {
    ...TextStyles.bodyLarge,
    fontWeight: "600",
    marginBottom: Layout.spacing.xs,
  },
  productBrand: {
    ...TextStyles.body,
    color: Colors.brandBlue[0],
    marginBottom: Layout.spacing.sm,
  },
  productMacros: {
    marginTop: Layout.spacing.sm,
  },
  caloriesText: {
    ...TextStyles.body,
    fontWeight: "600",
    color: Colors.brandBlue[0],
    marginBottom: Layout.spacing.xs,
  },
  macrosRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: Layout.spacing.xl,
  },
  macroText: {
    ...TextStyles.caption,
    color: Colors.gray.dark,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    backgroundColor: Colors.gray.light,
  },
  placeholderText: {
    backgroundColor: Colors.gray.light,
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    height: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Layout.spacing.md,
  },
  modalTitle: {
    ...TextStyles.h4,
  },
  scannerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.md,
    marginVertical: Layout.spacing.xl,
  },
  scannerPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    padding: Layout.spacing.lg,
  },
  scannerText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    textAlign: "center",
    marginTop: Layout.spacing.md,
  },
  cancelButton: {
    paddingVertical: Layout.spacing.md,
    alignItems: "center",
    backgroundColor: Colors.gray.ultraLight,
    borderRadius: Layout.borderRadius.pill,
    marginTop: Layout.spacing.lg,
  },
  cancelButtonText: {
    ...TextStyles.body,
    color: Colors.gray.dark,
    fontWeight: "600",
  },
  camera: {
    width: "100%",
    height: "100%",
    borderRadius: Layout.borderRadius.md,
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerTargetBorder: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: Colors.white,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
