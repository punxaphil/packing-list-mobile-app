if(NOT TARGET ReactAndroid::hermestooling)
add_library(ReactAndroid::hermestooling SHARED IMPORTED)
set_target_properties(ReactAndroid::hermestooling PROPERTIES
    IMPORTED_LOCATION "/Users/johan.frick/.gradle/caches/8.14.3/transforms/43b8102822689de62c1fe4cc39119c3e/transformed/react-android-0.81.5-debug/prefab/modules/hermestooling/libs/android.x86/libhermestooling.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/johan.frick/.gradle/caches/8.14.3/transforms/43b8102822689de62c1fe4cc39119c3e/transformed/react-android-0.81.5-debug/prefab/modules/hermestooling/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::jsi)
add_library(ReactAndroid::jsi SHARED IMPORTED)
set_target_properties(ReactAndroid::jsi PROPERTIES
    IMPORTED_LOCATION "/Users/johan.frick/.gradle/caches/8.14.3/transforms/43b8102822689de62c1fe4cc39119c3e/transformed/react-android-0.81.5-debug/prefab/modules/jsi/libs/android.x86/libjsi.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/johan.frick/.gradle/caches/8.14.3/transforms/43b8102822689de62c1fe4cc39119c3e/transformed/react-android-0.81.5-debug/prefab/modules/jsi/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::reactnative)
add_library(ReactAndroid::reactnative SHARED IMPORTED)
set_target_properties(ReactAndroid::reactnative PROPERTIES
    IMPORTED_LOCATION "/Users/johan.frick/.gradle/caches/8.14.3/transforms/43b8102822689de62c1fe4cc39119c3e/transformed/react-android-0.81.5-debug/prefab/modules/reactnative/libs/android.x86/libreactnative.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/johan.frick/.gradle/caches/8.14.3/transforms/43b8102822689de62c1fe4cc39119c3e/transformed/react-android-0.81.5-debug/prefab/modules/reactnative/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

